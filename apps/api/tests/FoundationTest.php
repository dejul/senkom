<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\TestCase;

final class FoundationTest extends TestCase
{
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        return $app;
    }

    public function test_health_is_liveness_without_database_or_credentials(): void
    {
        $this->getJson('/api/v1/health')->assertOk()->assertExactJson([
            'data' => ['status' => 'ok', 'phase' => 0],
            'meta' => ['apiVersion' => '1', 'schemaVersion' => 1],
        ]);
    }

    public function test_unimplemented_viewer_and_admin_routes_remain_unavailable(): void
    {
        $this->getJson('/api/v1/viewer/map')->assertNotFound()->assertExactJson([
            'error' => ['code' => 'HTTP_404', 'message' => 'Resource not found.'],
        ]);
        $this->postJson('/api/v1/admin/sites', [])->assertNotFound();
    }

    public function test_health_rejects_writes_with_json_error(): void
    {
        $this->postJson('/api/v1/health', [])->assertStatus(405)->assertJsonPath('error.code', 'HTTP_405');
    }
}
