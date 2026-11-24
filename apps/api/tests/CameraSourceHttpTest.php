<?php

declare(strict_types=1);

namespace Tests;

use App\Models\User;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CameraSourceHttpTest extends TestCase
{
    private User $admin;
    private string $csrf;
    private string $path = '/api/v1/admin/cameras/demo-camera-01/source';
    private string $uri = 'rtsp://synthetic-user:synthetic-password@camera.example.invalid:554/cam/realmonitor?channel=1&subtype=0';

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->afterBootstrapping(LoadConfiguration::class, function ($app): void {
            $app['config']->set([
                'senkom.enabled' => true, 'senkom.map_id' => 'test-map',
                'app.key' => 'base64:'.base64_encode(random_bytes(32)),
                'session.driver' => 'array', 'session.secure' => false, 'cache.default' => 'array',
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
        (new DemoSeeder())->run();
        $this->admin = User::create(['id' => (string) Str::uuid(), 'email' => 'source-admin@example.invalid', 'name' => 'Synthetic admin', 'password' => 'synthetic-password', 'roles' => ['system_admin']]);
        $this->csrf = bin2hex(random_bytes(20));
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        $this->withHeader('X-CSRF-TOKEN', $this->csrf);
    }

    protected function tearDown(): void
    {
        if ($this->app && DB::transactionLevel() > 0) DB::rollBack();
        parent::tearDown();
    }

    private function createSource(): void
    {
        $this->postJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $this->uri])->assertCreated()->assertJsonPath('data.configured', true);
    }

    public function test_write_only_source_lifecycle_and_public_boundary(): void
    {
        $this->getJson($this->path)->assertOk()->assertJsonPath('data.configured', false);
        $this->createSource();
        $this->postJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $this->uri])->assertStatus(422);
        $raw = DB::table('camera_sources')->where('map_id', 'test-map')->where('camera_id', 'demo-camera-01')->value('source_uri');
        self::assertNotSame($this->uri, $raw);
        self::assertStringNotContainsString('synthetic-password', $raw);
        foreach ([$this->getJson($this->path), $this->patchJson($this->path, ['enabled' => true]), $this->getJson('/api/v1/admin/cameras/demo-camera-01')] as $response) {
            $response->assertOk();
            self::assertStringNotContainsString('synthetic-password', $response->getContent());
            self::assertStringNotContainsString('camera.example.invalid', $response->getContent());
            self::assertStringNotContainsString($raw, $response->getContent());
        }
        self::assertSame($raw, DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'));
        $this->putJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => '********'])->assertStatus(422);
        $this->putJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => ''])->assertStatus(422);
        $this->putJson($this->path, ['sourceType' => 'rtsp'])->assertStatus(422);
        self::assertSame($raw, DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'));
        $replacement = 'rtsps://second-user:second-password@other.example.invalid/live?subtype=1';
        $response = $this->putJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $replacement])->assertOk();
        self::assertStringNotContainsString('second-password', $response->getContent());
        self::assertNotSame($raw, DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'));
        $encoded = 'rtsp://percent%40user:percent%25pass@camera.example.invalid/live';
        $this->putJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $encoded])->assertOk();
        self::assertStringNotContainsString('percent%25pass', DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'));
        $this->deleteJson($this->path)->assertOk()->assertJsonPath('data.configured', false);
        self::assertDatabaseHas('cameras', ['map_id' => 'test-map', 'id' => 'demo-camera-01']);
        self::assertDatabaseMissing('camera_sources', ['map_id' => 'test-map', 'camera_id' => 'demo-camera-01']);
        foreach (['camera_source.create', 'camera_source.enabled', 'camera_source.replace', 'camera_source.delete'] as $action) self::assertDatabaseHas('audit_logs', ['map_id' => 'test-map', 'action' => $action]);
        self::assertStringNotContainsString('second-password', json_encode(DB::table('audit_logs')->get()));
    }

    public function test_roles_map_grants_viewer_token_and_csrf(): void
    {
        $editor = User::create(['id' => (string) Str::uuid(), 'email' => 'source-editor@example.invalid', 'name' => 'Editor', 'password' => 'synthetic-password', 'roles' => ['infrastructure_editor']]);
        $publisher = User::create(['id' => (string) Str::uuid(), 'email' => 'source-publisher@example.invalid', 'name' => 'Publisher', 'password' => 'synthetic-password', 'roles' => ['publisher']]);
        DB::table('user_map_roles')->insert([
            ['user_id' => $editor->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $publisher->id, 'map_id' => 'test-map', 'role' => 'publisher'],
        ]);
        foreach ([$editor, $publisher] as $user) {
            $this->withSession(['admin_id' => $user->id, '_token' => $this->csrf]);
            $this->getJson($this->path)->assertOk();
            $this->postJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $this->uri])->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
            $this->patchJson($this->path, ['enabled' => true])->assertForbidden();
            $this->deleteJson($this->path)->assertForbidden();
            $this->getJson($this->path.'?mapId=missing-map')->assertForbidden();
        }
        DB::table('user_map_roles')->where('user_id', $editor->id)->delete();
        $this->withSession(['admin_id' => $editor->id, '_token' => $this->csrf]);
        $this->getJson($this->path)->assertForbidden();
        $this->withSession(['admin_id' => null, '_token' => $this->csrf]);
        $this->getJson($this->path)->assertUnauthorized();
        $this->withSession(['admin_id' => (string) Str::uuid(), '_token' => $this->csrf]);
        $this->getJson($this->path)->assertUnauthorized();
        $this->getJson($this->path, ['Authorization' => 'Bearer '.str_repeat('a', 64)])->assertForbidden();
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        $this->withHeader('X-CSRF-TOKEN', 'wrong');
        $this->postJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $this->uri])->assertStatus(419);
        $this->withHeader('X-CSRF-TOKEN', $this->csrf);
        self::assertDatabaseMissing('camera_sources', ['map_id' => 'test-map', 'camera_id' => 'demo-camera-01']);
    }

    public function test_invalid_and_cross_map_inputs_do_not_leak_or_mutate(): void
    {
        $this->createSource();
        $raw = DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri');
        DB::table('maps')->insert(['id' => 'other-map', 'name' => 'Other map', 'data_origin' => 'demo', 'demo_label' => 'Synthetic', 'width' => 100, 'height' => 100, 'layers' => '[]']);
        DB::table('sites')->insert(['map_id' => 'other-map', 'id' => 'other-site', 'code' => 'OTHER', 'name' => 'Other site', 'type' => 'field_site', 'status' => '{}']);
        DB::table('cameras')->insert(['map_id' => 'other-map', 'id' => 'demo-camera-01', 'code' => 'CAM-OTHER', 'site_id' => 'other-site', 'name' => 'Other camera', 'enabled' => true, 'created_at' => now(), 'updated_at' => now()]);
        $this->getJson($this->path.'?mapId=other-map')->assertOk()->assertJsonPath('data.configured', false);
        $this->postJson($this->path.'?mapId=other-map', ['sourceType' => 'rtsp', 'sourceUri' => 'rtsp://other.example.invalid/live'])->assertCreated();
        $this->deleteJson($this->path.'?mapId=other-map')->assertOk();
        self::assertSame($raw, DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'));
        foreach (['rtsp://synthetic-user:synthetic-password@host.example.invalid:0/live', 'rtsp://host.example.invalid/'.str_repeat('x', 4100), 'http://host.example.invalid/live'] as $invalid) {
            $response = $this->putJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $invalid])->assertStatus(422);
            self::assertStringNotContainsString('synthetic-password', $response->getContent());
            self::assertStringNotContainsString($invalid, $response->getContent());
        }
        $this->postJson($this->path, ['cameraId' => 'other', 'sourceType' => 'rtsp', 'sourceUri' => $this->uri])->assertStatus(422);
        $unknown = $this->postJson($this->path, ['rtsp://leaked-user:leaked-password@host.example.invalid/live' => 'x'])->assertStatus(422);
        self::assertStringNotContainsString('leaked-password', $unknown->getContent());
        $unknown = $this->putJson($this->path, ['sourceType' => 'rtsp', 'sourceUri' => $this->uri, 'rtsp://leaked-user:leaked-password@host.example.invalid/live' => 'x'])->assertStatus(422);
        self::assertStringNotContainsString('leaked-password', $unknown->getContent());
        $this->patchJson($this->path, ['enabled' => false, 'sourceUri' => $this->uri])->assertStatus(422);
        $this->getJson('/api/v1/admin/cameras/unknown/source')->assertNotFound();
        $this->putJson('/api/v1/admin/cameras/unknown/source', ['sourceType' => 'rtsp', 'sourceUri' => $this->uri])->assertNotFound();
        $this->deleteJson('/api/v1/admin/cameras/unknown/source')->assertNotFound();
        $this->getJson($this->path.'?mapId=unknown-map')->assertForbidden();
        self::assertSame($raw, DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'));
    }
}
