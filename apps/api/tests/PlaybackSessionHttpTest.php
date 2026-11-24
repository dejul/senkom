<?php

declare(strict_types=1);

namespace Tests;

use App\Models\User;
use App\Services\{CameraSourceStore, MapWorkflow};
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class PlaybackSessionHttpTest extends TestCase
{
    private User $admin;
    private string $viewer;
    private string $csrf;
    private string $path = '/api/v1/viewer/maps/test-map/cameras/demo-camera-01/playback-sessions';
    private string $sourceUri = 'rtsp://synthetic-user:synthetic-password@camera.example.invalid:554/cam/realmonitor?channel=1&subtype=0';

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->afterBootstrapping(LoadConfiguration::class, function ($app): void {
            $app['config']->set([
                'senkom.enabled' => true,
                'senkom.map_id' => 'test-map',
                'senkom.playback.ttl_seconds' => 60,
                'senkom.playback.paths' => ['test-map' => ['demo-camera-01' => 'lab', 'demo-camera-04' => 'lab-b']],
                'app.key' => 'base64:'.base64_encode(random_bytes(32)),
                'session.driver' => 'array',
                'session.secure' => false,
                'cache.default' => 'array',
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
        $this->admin = User::create(['id' => (string) Str::uuid(), 'email' => 'playback-admin@example.invalid', 'name' => 'Synthetic admin', 'password' => 'synthetic-password', 'roles' => ['system_admin']]);
        DB::table('cameras')->where('map_id', 'test-map')->whereIn('id', ['demo-camera-01', 'demo-camera-04'])->update(['enabled' => true]);
        $this->viewer = bin2hex(random_bytes(32));
        DB::table('viewer_tokens')->insert(['id' => (string) Str::uuid(), 'name' => 'Synthetic viewer', 'map_id' => 'test-map', 'token_hash' => hash('sha256', $this->viewer), 'expires_at' => now()->addHour(), 'created_at' => now(), 'updated_at' => now()]);
        $this->csrf = bin2hex(random_bytes(20));
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        $this->withHeader('X-CSRF-TOKEN', $this->csrf);
        app(CameraSourceStore::class)->create('test-map', ['cameraId' => 'demo-camera-01', 'sourceType' => 'rtsp', 'sourceUri' => $this->sourceUri, 'enabled' => true]);
        app(CameraSourceStore::class)->create('test-map', ['cameraId' => 'demo-camera-04', 'sourceType' => 'rtsp', 'sourceUri' => 'rtsp://synthetic-user:synthetic-password@camera-b.example.invalid:554/cam/realmonitor?channel=4&subtype=0', 'enabled' => true]);
    }

    protected function tearDown(): void
    {
        \Illuminate\Support\Carbon::setTestNow();
        if ($this->app && DB::transactionLevel() > 0) DB::rollBack();
        parent::tearDown();
    }

    private function publish(): void
    {
        $workflow = app(MapWorkflow::class);
        $map = $workflow->map('test-map');
        $etag = $workflow->etag($map);
        $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $etag])->assertOk()->assertJsonPath('data.valid', true);
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $etag])->assertCreated();
    }

    private function issue(string $protocol = 'hls')
    {
        return $this->postJson($this->path, ['protocol' => $protocol], ['Authorization' => 'Bearer '.$this->viewer]);
    }

    private function issueCamera(string $cameraId, string $protocol = 'hls')
    {
        return $this->postJson('/api/v1/viewer/maps/test-map/cameras/'.$cameraId.'/playback-sessions', ['protocol' => $protocol], ['Authorization' => 'Bearer '.$this->viewer]);
    }

    private function gateway(string $token, array $overrides = [])
    {
        return $this->postJson('/api/v1/gateway/auth', array_replace([
            'user' => 'senkom-viewer',
            'password' => $token,
            'action' => 'read',
            'path' => 'lab',
            'protocol' => 'hls',
        ], $overrides));
    }

    public function test_issues_short_lived_secret_safe_token_for_published_enabled_camera(): void
    {
        $this->publish();
        $response = $this->issue()->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('data.mapId', 'test-map')
            ->assertJsonPath('data.cameraId', 'demo-camera-01')
            ->assertJsonPath('data.protocol', 'hls')
            ->assertJsonPath('data.endpoint', 'http://127.0.0.1:8888/lab/index.m3u8')
            ->assertJsonPath('data.authScheme', 'Basic')
            ->assertJsonPath('data.authUsername', 'senkom-viewer')
            ->assertJsonPath('data.expiresInSeconds', 60);
        $token = $response->json('data.accessToken');
        self::assertIsString($token);
        self::assertSame(24, strlen($response->json('data.sessionId')));
        self::assertStringNotContainsString($this->sourceUri, $response->getContent());
        self::assertStringNotContainsString('synthetic-password', $response->getContent());
        self::assertStringNotContainsString('camera.example.invalid', $response->getContent());
        self::assertStringNotContainsString(DB::table('camera_sources')->where('map_id', 'test-map')->value('source_uri'), $response->getContent());
        $this->gateway($token)->assertNoContent();
        $this->gateway($token, ['protocol' => 'webrtc'])->assertUnauthorized();
        $this->gateway($token, ['path' => 'lab-b'])->assertUnauthorized();
        $this->gateway($token, ['action' => 'publish'])->assertUnauthorized();
        $this->gateway($token, ['action' => 'api'])->assertUnauthorized();
        $this->gateway('invalid-token')->assertUnauthorized();
    }

    public function test_viewer_map_snapshot_source_and_token_must_all_remain_eligible(): void
    {
        $this->publish();
        $this->postJson('/api/v1/viewer/maps/other-map/cameras/demo-camera-01/playback-sessions', ['protocol' => 'hls'], ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        $this->postJson('/api/v1/viewer/maps/test-map/cameras/demo-camera-02/playback-sessions', ['protocol' => 'hls'], ['Authorization' => 'Bearer '.$this->viewer])->assertNotFound();
        $this->issue('rtsp')->assertStatus(422);
        $this->postJson($this->path, ['protocol' => 'hls', 'url' => 'http://127.0.0.1:8888/lab'], ['Authorization' => 'Bearer '.$this->viewer])->assertStatus(422);
        $token = $this->issue()->assertOk()->json('data.accessToken');
        $cameraBToken = $this->issueCamera('demo-camera-04')->assertOk()->json('data.accessToken');
        $this->gateway($cameraBToken, ['path' => 'lab-b'])->assertNoContent();
        $this->gateway($cameraBToken, ['path' => 'lab'])->assertUnauthorized();

        DB::table('viewer_tokens')->where('token_hash', hash('sha256', $this->viewer))->update(['revoked_at' => now()]);
        $this->issue()->assertUnauthorized();
        $this->gateway($token)->assertUnauthorized();
    }

    public function test_gateway_rechecks_source_state_and_expiry_on_each_authorized_request(): void
    {
        $this->publish();
        $token = $this->issue()->assertOk()->json('data.accessToken');
        DB::table('camera_sources')->where('map_id', 'test-map')->where('camera_id', 'demo-camera-01')->update(['enabled' => false]);
        $this->gateway($token)->assertUnauthorized();
        DB::table('camera_sources')->where('map_id', 'test-map')->where('camera_id', 'demo-camera-01')->update(['enabled' => true]);
        $this->gateway($token)->assertNoContent();

        app(CameraSourceStore::class)->updateForCamera('test-map', 'demo-camera-01', [
            'sourceUri' => 'rtsps://replacement-user:replacement-password@new-camera.example.invalid:322/camera',
        ]);
        $this->gateway($token)->assertNoContent();

        self::assertTrue(app(CameraSourceStore::class)->deleteForCamera('test-map', 'demo-camera-01'));
        $this->gateway($token)->assertUnauthorized();
        app(CameraSourceStore::class)->create('test-map', [
            'cameraId' => 'demo-camera-01',
            'sourceType' => 'rtsp',
            'sourceUri' => $this->sourceUri,
            'enabled' => true,
        ]);

        \Illuminate\Support\Carbon::setTestNow(now()->addSeconds(61));
        $this->gateway($token)->assertUnauthorized();
    }

    public function test_unpublished_and_disabled_cameras_cannot_receive_sessions(): void
    {
        $this->issue()->assertNotFound();
        $this->publish();
        DB::table('camera_sources')->where('map_id', 'test-map')->where('camera_id', 'demo-camera-01')->update(['enabled' => false]);
        $this->issue()->assertNotFound();
    }

    public function test_exact_origin_and_preflight_policy_rejects_untrusted_origins(): void
    {
        $this->publish();
        $this->options('/api/v1/viewer/maps/test-map/cameras/demo-camera-01/playback-sessions', [], [
            'Origin' => 'https://evil.example',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'authorization, content-type',
        ])->assertForbidden();
        $this->options('/api/v1/viewer/maps/test-map/cameras/demo-camera-01/playback-sessions', [], [
            'Origin' => 'http://127.0.0.1:8000',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'authorization, content-type',
        ])->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
        $this->postJson($this->path, ['protocol' => 'hls'], ['Authorization' => 'Bearer '.$this->viewer, 'Origin' => 'https://evil.example'])->assertForbidden();
        $this->postJson($this->path, ['protocol' => 'hls'], ['Authorization' => 'Bearer '.$this->viewer, 'Origin' => 'http://127.0.0.1:8000'])->assertOk()->assertHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
    }

    public function test_gateway_publish_requires_separate_synthetic_publisher_credential(): void
    {
        config(['senkom.playback.publisher_password' => 'synthetic-publisher-only']);
        $base = ['user' => 'senkom-publisher', 'password' => 'synthetic-publisher-only', 'action' => 'publish', 'path' => 'lab', 'protocol' => 'rtsp'];
        $this->postJson('/api/v1/gateway/auth', $base)->assertNoContent();
        $this->postJson('/api/v1/gateway/auth', array_replace($base, ['path' => 'lab-b']))->assertNoContent();
        $this->postJson('/api/v1/gateway/auth', array_replace($base, ['path' => 'unconfigured']))->assertUnauthorized();
        $this->postJson('/api/v1/gateway/auth', array_replace($base, ['action' => 'read']))->assertUnauthorized();
        config(['senkom.playback.publisher_password' => '']);
        $this->postJson('/api/v1/gateway/auth', $base)->assertUnauthorized();
        $this->call('POST', '/api/v1/gateway/auth', [], [], [], ['CONTENT_TYPE' => 'application/json'], json_encode(['user' => 'senkom-viewer', 'password' => str_repeat('x', 9000)]))->assertUnauthorized();
    }
}
