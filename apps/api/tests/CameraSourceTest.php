<?php

declare(strict_types=1);

namespace Tests;

use App\Models\{Camera, CameraSource};
use App\Services\CameraSourceStore;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class CameraSourceTest extends TestCase
{
    private CameraSourceStore $sources;
    private array $maps = ['map-a', 'map-b'];

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->afterBootstrapping(LoadConfiguration::class, function ($app): void {
            $app['config']->set([
                'senkom.enabled' => true,
                'senkom.map_id' => 'map-a',
                'app.key' => 'base64:'.base64_encode(random_bytes(32)),
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => getenv('SENKOM_TEST_DB_PORT') ?: '3306',
                'database.connections.mysql.database' => getenv('SENKOM_TEST_DB_DATABASE') ?: 'senkom_test',
                'database.connections.mysql.username' => getenv('SENKOM_TEST_DB_USERNAME') ?: 'root',
                'database.connections.mysql.password' => getenv('SENKOM_TEST_DB_PASSWORD') ?: '',
            ]);
        });
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();
        if (!getenv('SENKOM_TEST_DB_PORT')) $this->markTestSkipped('Set SENKOM_TEST_DB_PORT for isolated MySQL integration tests.');
        if (!str_ends_with(config('database.connections.mysql.database'), '_test')) throw new \RuntimeException('Tests require a dedicated *_test database.');
        self::assertSame(0, \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]));
        DB::beginTransaction();
        foreach ($this->maps as $map) {
            DB::table('maps')->insert(['id' => $map, 'name' => $map, 'data_origin' => 'demo', 'demo_label' => 'DEMO test', 'width' => 100, 'height' => 100, 'layers' => '[]']);
            DB::table('sites')->insert(['map_id' => $map, 'id' => 'same-site', 'code' => 'same-site', 'name' => 'Synthetic site', 'type' => 'field_site', 'status' => '{}']);
            DB::table('cameras')->insert(['map_id' => $map, 'id' => 'same-camera', 'code' => 'same-camera', 'site_id' => 'same-site', 'name' => 'Synthetic camera', 'enabled' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
        $this->sources = app(CameraSourceStore::class);
    }

    protected function tearDown(): void
    {
        if ($this->app && DB::transactionLevel() > 0) DB::rollBack();
        parent::tearDown();
    }

    private function input(string $uri = 'rtsp://user-sentinel:password-sentinel@camera.example.invalid:554/live?token=query-sentinel'): array
    {
        return ['cameraId' => 'same-camera', 'sourceType' => 'rtsp', 'sourceUri' => $uri];
    }

    public function test_source_is_encrypted_persisted_map_scoped_and_updateable_without_secret_reset(): void
    {
        $uri = 'rtsp://user-sentinel:password-sentinel@camera.example.invalid:554/live?token=query-sentinel';
        $source = $this->sources->create('map-a', $this->input($uri));
        $raw = DB::table('camera_sources')->where('map_id', 'map-a')->where('id', $source->id)->value('source_uri');

        self::assertNotSame($uri, $raw);
        foreach (['user-sentinel', 'password-sentinel', 'query-sentinel', 'camera.example.invalid'] as $sentinel) self::assertStringNotContainsString($sentinel, $raw);
        self::assertSame($uri, $source->source_uri);
        self::assertFalse($source->enabled);
        self::assertSame($source->id, $this->sources->find('map-a', $source->id)?->id);
        self::assertNull($this->sources->find('map-b', $source->id));

        $this->sources->updateForCamera('map-a', 'same-camera', ['enabled' => true]);
        self::assertSame($raw, DB::table('camera_sources')->where('map_id', 'map-a')->where('id', $source->id)->value('source_uri'));
        self::assertTrue($this->sources->findForCamera('map-a', 'same-camera')->enabled);

        $updated = 'rtsps://new-user:new-password@secure.example.invalid/live';
        $this->sources->updateForCamera('map-a', 'same-camera', ['sourceUri' => $updated]);
        $updatedRaw = DB::table('camera_sources')->where('map_id', 'map-a')->where('id', $source->id)->value('source_uri');
        self::assertNotSame($updated, $updatedRaw);
        self::assertSame($updated, $this->sources->findForCamera('map-a', 'same-camera')->source_uri);
    }

    public function test_map_scoped_foreign_key_and_relationships_reject_cross_map_association(): void
    {
        $a = $this->sources->create('map-a', $this->input());
        $b = $this->sources->create('map-b', $this->input());
        self::assertNotSame($a->id, $b->id);
        self::assertTrue($this->sources->findForCamera('map-a', 'same-camera')->is($a));
        self::assertTrue($this->sources->findForCamera('map-b', 'same-camera')->is($b));

        $eager = CameraSource::with('camera')->whereIn('map_id', $this->maps)->orderBy('map_id')->get();
        self::assertCount(2, $eager);
        foreach ($eager as $source) self::assertSame($source->map_id, $source->camera->map_id);
        self::assertSame('map-a', $a->camera->map_id);

        DB::table('cameras')->insert(['map_id' => 'map-b', 'id' => 'map-b-only', 'code' => 'map-b-only', 'site_id' => 'same-site', 'name' => 'Map B camera', 'enabled' => true, 'created_at' => now(), 'updated_at' => now()]);
        try {
            $this->sources->create('map-a', ['cameraId' => 'map-b-only', 'sourceType' => 'rtsp', 'sourceUri' => 'rtsp://host.example.invalid/live']);
            self::fail('Cross-map camera association was accepted.');
        } catch (ValidationException $error) {
            self::assertSame(['Camera is unavailable.'], $error->errors()['cameraId']);
        }

        $this->expectException(QueryException::class);
        DB::table('camera_sources')->insert(['map_id' => 'map-a', 'id' => (string) Str::uuid(), 'camera_id' => 'map-b-only', 'source_type' => 'rtsp', 'source_uri' => 'ciphertext', 'enabled' => false, 'created_at' => now(), 'updated_at' => now()]);
    }

    public function test_validation_errors_are_generic_and_protocol_is_limited_to_rtsp(): void
    {
        foreach (['https://user-sentinel:password-sentinel@host.example/live', 'rtsp:/missing-host', 'rtsp://host:0/live', "rtsp://host.example/line\nbreak", 'rtsp://host.example/%zz', 'rtsp://host.example/%0aheader', 'rtsp://host.example/'.str_repeat('x', 4100)] as $uri) {
            try {
                $this->sources->create('map-a', $this->input($uri));
                self::fail('Invalid source URI was accepted.');
            } catch (ValidationException $error) {
                $message = json_encode($error->errors(), JSON_THROW_ON_ERROR);
                self::assertStringNotContainsString('user-sentinel', $message);
                self::assertStringNotContainsString('password-sentinel', $message);
                self::assertStringNotContainsString($uri, $message);
            }
        }

        try {
            $this->sources->create('map-a', ['cameraId' => 'same-camera']);
            self::fail('Required source fields were accepted as missing.');
        } catch (ValidationException $error) {
            self::assertArrayHasKey('sourceType', $error->errors());
            self::assertArrayHasKey('sourceUri', $error->errors());
        }
    }

    public function test_duplicate_disabled_deleted_and_corrupt_ciphertext_lifecycle(): void
    {
        $source = $this->sources->create('map-a', $this->input());
        try {
            $this->sources->create('map-a', $this->input());
            self::fail('Duplicate camera source was accepted.');
        } catch (ValidationException $error) {
            self::assertSame(['Camera source already exists.'], $error->errors()['cameraId']);
        }
        self::assertTrue($this->sources->disableForCamera('map-a', 'same-camera'));
        self::assertFalse($this->sources->findForCamera('map-a', 'same-camera')->enabled);
        self::assertTrue($this->sources->deleteForCamera('map-a', 'same-camera'));
        self::assertNull($this->sources->findForCamera('map-a', 'same-camera'));
        self::assertFalse($this->sources->disableForCamera('map-a', 'same-camera'));

        $source = $this->sources->create('map-a', $this->input());
        DB::table('camera_sources')->where('map_id', 'map-a')->where('id', $source->id)->update(['source_uri' => 'not-a-valid-ciphertext']);
        $corrupt = CameraSource::where('map_id', 'map-a')->whereKey($source->id)->firstOrFail();
        $this->expectException(\Illuminate\Contracts\Encryption\DecryptException::class);
        $corrupt->source_uri;
    }

    public function test_model_serialization_and_nested_camera_never_include_source_uri(): void
    {
        $source = $this->sources->create('map-a', $this->input())->load('camera');
        self::assertFalse($source->isFillable('source_uri'));
        self::assertContains('source_uri', $source->getHidden());
        $json = $source->toJson();
        $array = json_encode($source->toArray(), JSON_THROW_ON_ERROR);

        foreach ([$json, $array] as $serialized) {
            self::assertStringNotContainsString('source_uri', $serialized);
            self::assertStringNotContainsString('user-sentinel', $serialized);
            self::assertStringNotContainsString('password-sentinel', $serialized);
            self::assertStringNotContainsString('query-sentinel', $serialized);
        }
        self::assertNull(Camera::where('map_id', 'map-a')->firstOrFail()->getAttribute('source_uri'));
    }
}
