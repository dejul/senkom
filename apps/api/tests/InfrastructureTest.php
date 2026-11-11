<?php

declare(strict_types=1);

namespace Tests;

use App\Models\{InfrastructureMap, MapRevision, Site, User};
use App\Services\{InventoryStore, MapRules, MapWorkflow};
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\{DB, Hash};
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;

final class InfrastructureTest extends TestCase
{
    private User $admin;
    private string $csrf;
    private string $viewer;
    private MapWorkflow $workflow;

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->afterBootstrapping(LoadConfiguration::class, function ($app) {
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
        $this->admin = User::create(['id' => (string) Str::uuid(), 'email' => 'admin@example.invalid', 'name' => 'DEMO admin', 'password' => 'synthetic-test-password', 'roles' => ['system_admin']]);
        $this->csrf = bin2hex(random_bytes(20));
        $this->viewer = bin2hex(random_bytes(32));
        DB::table('viewer_tokens')->insert(['id' => (string) Str::uuid(), 'name' => 'DEMO viewer', 'map_id' => 'test-map', 'token_hash' => hash('sha256', $this->viewer), 'expires_at' => now()->addHour(), 'created_at' => now(), 'updated_at' => now()]);
        $this->workflow = app(MapWorkflow::class);
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        $this->withHeader('X-CSRF-TOKEN', $this->csrf);
    }

    protected function tearDown(): void
    {
        if ($this->app && DB::transactionLevel() > 0) DB::rollBack();
        parent::tearDown();
    }

    private function draft(): array { return $this->getJson('/api/v1/admin/map/draft')->assertOk()->json('data'); }
    private function etag(): string { return '"draft:'.$this->draft()['version'].'"'; }
    private function content(): array { return $this->draft()['content']; }
    private function publish(): string
    {
        $etag = $this->etag();
        $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $etag])->assertOk()->assertJsonPath('data.valid', true);
        return $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $etag])->assertCreated()->json('data.revisionId');
    }
    private function viewerMap(string $version = '2', array $headers = [])
    {
        return $this->getJson('/api/v1/viewer/map?schemaVersion='.$version, ['Authorization' => 'Bearer '.$this->viewer] + $headers);
    }

    public function test_schema_seed_models_and_computed_allocation(): void
    {
        $content = $this->content();
        self::assertCount(8, $content['sites']);
        self::assertSame([], $this->workflow->rules->inspect($content, true));
        self::assertSame('allocated', $content['fiberCores'][0]['status']);
        $site = Site::where('map_id', 'test-map')->whereKey('demo-site-01')->firstOrFail();
        self::assertCount(2, $site->devices);
        self::assertCount(1, $site->devices->first()->ports);
        $content['logicalLinks'] = [];
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk()->assertJsonPath('data.content.fiberCores.0.status', 'unallocated');
    }

    public function test_ring_identity_order_direction_and_visual_separation(): void
    {
        $content = $this->content();
        $path = $content['logicalLinks'][0]['coreSegments'];
        self::assertSame('fo_ring_a', $content['logicalLinks'][0]['routeName']);
        self::assertSame([], $this->workflow->rules->inspect($content, true));
        $edge = $content['layout']['edges'][0];
        $edge['id'] = 'ring-edge';
        $edge['connectionType'] = 'logical_link';
        $edge['connectionId'] = $content['logicalLinks'][0]['id'];
        $edge['toNodeId'] = 'demo-node-04';
        $edge['points'][1]['x'] = 1400;
        $content['layout']['edges'][] = $edge;
        self::assertSame([], $this->workflow->rules->inspect($content, true));

        $invalid = $content;
        $invalid['logicalLinks'][0]['routeName'] = 'fo_ring_c';
        self::assertSame('SCHEMA', $this->workflow->rules->inspect($invalid)[0]['code']);
        $invalid = $content;
        $invalid['logicalLinks'][0]['coreSegments'] = [$path[0], $path[0]];
        self::assertSame('SCHEMA', $this->workflow->rules->inspect($invalid)[0]['code']);
        $invalid = $content;
        $invalid['logicalLinks'][0]['coreSegments'] = ['missing-core'];
        self::assertContains('REFERENCE', array_column($this->workflow->rules->inspect($invalid), 'code'));
        $invalid = $content;
        $invalid['logicalLinks'][0]['coreSegments'] = array_reverse($path);
        self::assertContains('PATH_START', array_column($this->workflow->rules->inspect($invalid, true), 'code'));

        $ringB = $content;
        $ringB['logicalLinks'][0]['routeName'] = 'fo_ring_b';
        self::assertContains('REFERENCE', array_column($this->workflow->rules->inspect($ringB), 'code'));
        foreach ($ringB['layout']['edges'] as &$edge) if ($edge['connectionType'] === 'logical_link') $edge['layer'] = 'fo_ring_b';
        unset($edge);
        self::assertSame([], $this->workflow->rules->inspect($ringB, true));
        $this->putJson('/api/v1/admin/map/draft', $ringB, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame('fo_ring_b', $this->content()['logicalLinks'][0]['routeName']);
        self::assertSame($path, $this->content()['logicalLinks'][0]['coreSegments']);
        $ringB['layout']['edges'] = [];
        self::assertSame([], $this->workflow->rules->inspect($ringB, true));
    }

    public function test_fo_end_to_end_continuity_and_terminations(): void
    {
        $content = $this->content();
        self::assertSame([], $this->workflow->rules->inspect($content, true));
        $reverse = $content;
        $reverse['logicalLinks'][0]['coreSegments'] = array_reverse($reverse['logicalLinks'][0]['coreSegments']);
        [$reverse['logicalLinks'][0]['fromPortId'], $reverse['logicalLinks'][0]['toPortId']] = [$reverse['logicalLinks'][0]['toPortId'], $reverse['logicalLinks'][0]['fromPortId']];
        self::assertSame([], $this->workflow->rules->inspect($reverse, true));

        foreach ([
            'missing source termination' => [fn (&$map) => array_shift($map['fiberTerminations']), 'PATH_START'],
            'wrong source port' => [function (&$map) { $port = $map['ports'][0]; $port['id'] = 'other-source'; $port['name'] = 'Other source'; $map['ports'][] = $port; $map['logicalLinks'][0]['fromPortId'] = $port['id']; }, 'PATH_START'],
            'first splice missing' => [fn (&$map) => array_shift($map['fiberSplices']), 'PATH_GAP'],
            'second splice missing' => [fn (&$map) => array_pop($map['fiberSplices']), 'PATH_GAP'],
            'middle cores out of order' => [fn (&$map) => $map['logicalLinks'][0]['coreSegments'] = ['demo-core-01', 'demo-core-03', 'demo-core-02'], 'PATH_GAP'],
            'missing destination termination' => [fn (&$map) => array_pop($map['fiberTerminations']), 'PATH_END'],
            'wrong destination port' => [function (&$map) { $port = $map['ports'][1]; $port['id'] = 'other-destination'; $port['name'] = 'Other destination'; $map['ports'][] = $port; $map['logicalLinks'][0]['toPortId'] = $port['id']; }, 'PATH_END'],
        ] as $name => [$change, $code]) {
            $broken = $content;
            $change($broken);
            self::assertSame([], $this->workflow->rules->inspect($broken), $name.' draft');
            self::assertContains($code, array_column($this->workflow->rules->inspect($broken, true), 'code'), $name.' publish');
        }
    }

    public function test_fo_broken_draft_cannot_replace_published_path(): void
    {
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->getContent();
        $physical = [DB::table('fiber_terminations')->where('map_id', 'test-map')->count(), DB::table('fiber_splices')->where('map_id', 'test-map')->count()];
        $draft = $this->content();
        $draft['logicalLinks'][0]['coreSegments'] = ['demo-core-01', 'demo-core-03', 'demo-core-02'];
        $this->putJson('/api/v1/admin/map/draft', $draft, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($draft['logicalLinks'][0]['coreSegments'], $this->content()['logicalLinks'][0]['coreSegments']);
        $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $this->etag()])->assertOk();
        self::assertFalse($validation->json('data.valid'));
        self::assertContains('PATH_GAP', array_column($validation->json('data.issues'), 'code'));
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertStatus(409)->assertJsonPath('error.code', 'VALIDATION_REQUIRED');
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        self::assertSame($physical, [DB::table('fiber_terminations')->where('map_id', 'test-map')->count(), DB::table('fiber_splices')->where('map_id', 'test-map')->count()]);
    }

    public function test_fo_parallel_rings_share_cables_but_not_cores_or_link_ports(): void
    {
        $content = $this->content();
        $path = [];
        foreach (array_values($content['fiberCores']) as $core) {
            $core['id'] = 'ring-b-'.$core['id'];
            $core['coreNumber'] = 2;
            $core['status'] = 'unallocated';
            $path[] = $core['id'];
            $content['fiberCores'][] = $core;
        }
        foreach ([0, 1] as $index) {
            $port = $content['ports'][$index];
            $port['id'] = 'ring-b-'.$port['id'];
            $port['name'] = 'Ring B '.$port['name'];
            $content['ports'][] = $port;
        }
        foreach (array_values($content['fiberTerminations']) as $index => $term) {
            $term['id'] = 'ring-b-'.$term['id'];
            $term['fiberCoreId'] = $path[$index === 0 ? 0 : 2];
            $term['portId'] = 'ring-b-'.$term['portId'];
            $content['fiberTerminations'][] = $term;
        }
        foreach (array_values($content['fiberSplices']) as $index => $splice) {
            $splice['id'] = 'ring-b-'.$splice['id'];
            $splice['fromFiberCoreId'] = $path[$index];
            $splice['toFiberCoreId'] = $path[$index + 1];
            $content['fiberSplices'][] = $splice;
        }
        $link = $content['logicalLinks'][0];
        $link['id'] = 'ring-b-link';
        $link['code'] = 'RING-B-LINK';
        $link['fromPortId'] = 'ring-b-'.$link['fromPortId'];
        $link['toPortId'] = 'ring-b-'.$link['toPortId'];
        $link['routeName'] = 'fo_ring_b';
        $link['coreSegments'] = $path;
        $content['logicalLinks'][] = $link;
        self::assertSame([], $this->workflow->rules->inspect($content, true));
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
        $stored = $this->content();
        self::assertSame(['fo_ring_a', 'fo_ring_b'], array_column($stored['logicalLinks'], 'routeName'));
        self::assertSame($path, $stored['logicalLinks'][1]['coreSegments']);
        foreach ($path as $id) self::assertSame('allocated', collect($stored['fiberCores'])->firstWhere('id', $id)['status']);
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->getContent();
        self::assertSame(2, count(json_decode($published, true)['data']['logicalLinks']));
        try { DB::table('logical_link_core_segments')->where('map_id', 'test-map')->where('logical_link_id', 'ring-b-link')->where('sequence', 0)->update(['fiber_core_id' => 'demo-core-01']); self::fail('Core cannot be allocated to both rings.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }

        foreach (['fo_ring_a', 'fo_ring_b'] as $route) {
            $conflict = $stored;
            $conflict['logicalLinks'][1]['routeName'] = $route;
            $conflict['logicalLinks'][1]['coreSegments'] = $stored['logicalLinks'][0]['coreSegments'];
            self::assertContains('CORE_CONFLICT', array_column($this->workflow->rules->inspect($conflict), 'code'));
        }
        $this->putJson('/api/v1/admin/map/draft', $conflict, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'CORE_CONFLICT');
        self::assertSame($stored, $this->content());

        $conflict = $stored;
        $conflict['logicalLinks'][1]['fromPortId'] = $stored['logicalLinks'][0]['fromPortId'];
        foreach ($conflict['fiberTerminations'] as &$term) if ($term['fiberCoreId'] === $path[0]) $term['portId'] = $conflict['logicalLinks'][1]['fromPortId'];
        unset($term);
        self::assertSame([], $this->workflow->rules->inspect($conflict));
        self::assertContains('PORT_CONFLICT', array_column($this->workflow->rules->inspect($conflict, true), 'code'));
        $this->putJson('/api/v1/admin/map/draft', $conflict, ['If-Match' => $this->etag()])->assertOk();
        $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $this->etag()])->assertOk();
        self::assertContains('PORT_CONFLICT', array_column($validation->json('data.issues'), 'code'));
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertStatus(409);
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
    }

    public static function unavailableCoreStatuses(): array
    {
        return ['faulty' => ['faulty'], 'unknown' => ['unknown']];
    }

    #[DataProvider('unavailableCoreStatuses')]
    public function test_fo_unavailable_core_stays_inventory_but_cannot_publish_active_path(string $status): void
    {
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->getContent();
        $physical = [DB::table('fiber_terminations')->where('map_id', 'test-map')->count(), DB::table('fiber_splices')->where('map_id', 'test-map')->count()];
        $this->patchJson('/api/v1/admin/fiber-cores/demo-core-02', ['status' => $status], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/fiber-cores/demo-core-02')->assertOk()->assertJsonPath('data.status', $status);
        self::assertSame($status, DB::table('fiber_cores')->where('map_id', 'test-map')->where('id', 'demo-core-02')->value('condition'));
        $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $this->etag()])->assertOk();
        self::assertFalse($validation->json('data.valid'));
        self::assertContains('CORE_UNAVAILABLE', array_column($validation->json('data.issues'), 'code'));
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertStatus(409)->assertJsonPath('error.code', 'VALIDATION_REQUIRED');
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        self::assertSame($physical, [DB::table('fiber_terminations')->where('map_id', 'test-map')->count(), DB::table('fiber_splices')->where('map_id', 'test-map')->count()]);

        $draft = $this->content();
        $draft['logicalLinks'] = [];
        $this->putJson('/api/v1/admin/map/draft', $draft, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($status, collect($this->content()['fiberCores'])->firstWhere('id', 'demo-core-02')['status']);
        $this->publish();
        $inventory = $this->viewerMap()->assertOk()->json('data');
        self::assertSame([], $inventory['logicalLinks']);
        self::assertSame($status, collect($inventory['fiberCores'])->firstWhere('id', 'demo-core-02')['status']);
        self::assertCount($physical[0], $inventory['fiberTerminations']);
        self::assertCount($physical[1], $inventory['fiberSplices']);
    }

    public function test_fo_link_allocation_stays_within_its_map(): void
    {
        $this->secondMap();
        DB::table('cables')->insert(['map_id' => 'other-map', 'id' => 'only-b-cable', 'code' => 'ONLY-B-CABLE', 'kind' => 'fiber', 'from_site_id' => 'only-b-site', 'to_site_id' => 'demo-site-01', 'length_m' => 1, 'status' => '{}']);
        DB::table('fiber_cable_details')->insert(['map_id' => 'other-map', 'cable_id' => 'only-b-cable', 'total_cores' => 2, 'fiber_type' => 'single_mode']);
        foreach (['demo-core-01', 'only-b-core'] as $number => $id) DB::table('fiber_cores')->insert(['map_id' => 'other-map', 'id' => $id, 'cable_id' => 'only-b-cable', 'core_number' => $number + 1]);
        $this->getJson('/api/v1/admin/fiber-cores/demo-core-01?mapId=other-map')->assertOk()->assertJsonPath('data.status', 'unallocated');
        $this->getJson('/api/v1/admin/fiber-cores/demo-core-01?mapId=test-map')->assertOk()->assertJsonPath('data.status', 'allocated');

        $before = $this->content();
        $invalid = $before;
        $invalid['logicalLinks'][0]['coreSegments'][1] = 'only-b-core';
        $response = $this->putJson('/api/v1/admin/map/draft', $invalid, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        self::assertStringNotContainsString('OTHER-MAP-MARKER', $response->getContent());
        self::assertStringNotContainsString('only-b-core', $response->getContent());
        self::assertSame($before, $this->content());
        try { DB::table('logical_link_core_segments')->insert(['map_id' => 'test-map', 'logical_link_id' => 'demo-link-a', 'fiber_core_id' => 'only-b-core', 'sequence' => 99]); self::fail('Cross-map FK must reject core.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        $this->getJson('/api/v1/admin/fiber-cores/only-b-core?mapId=test-map')->assertNotFound();
    }

    public function test_fo_cable_subtype_capacity_endpoint_and_visual_separation(): void
    {
        $content = $this->content();
        self::assertSame([], $this->workflow->rules->inspect($content));
        self::assertSame(12, (int) DB::table('fiber_cable_details')->where('map_id', 'test-map')->where('cable_id', 'demo-fo-01')->value('total_cores'));
        self::assertSame(3, DB::table('fiber_cable_details')->where('map_id', 'test-map')->count());

        $invalid = $content;
        $invalid['cables'][0]['totalCores'] = 0;
        self::assertSame('SCHEMA', $this->workflow->rules->inspect($invalid)[0]['code']);
        $invalid = $content;
        $invalid['cables'][0]['totalCores'] = 6913;
        self::assertSame('SCHEMA', $this->workflow->rules->inspect($invalid)[0]['code']);
        $invalid = $content;
        $invalid['cables'][0]['fromSiteId'] = 'missing-site';
        self::assertSame('REFERENCE', $this->workflow->rules->inspect($invalid)[0]['code']);
        $invalid = $content;
        $invalid['cables'][0]['kind'] = 'power';
        self::assertSame('SCHEMA', $this->workflow->rules->inspect($invalid)[0]['code']);

        $content['layout']['edges'] = [];
        self::assertSame([], $this->workflow->rules->inspect($content));
    }

    public function test_power_cable_subtype_terminal_and_visual_separation(): void
    {
        $power = ['id' => 'power-extra', 'code' => 'POWER-EXTRA', 'kind' => 'power', 'fromSiteId' => 'demo-site-02', 'toSiteId' => 'demo-site-03', 'lengthM' => 45, 'status' => ['state' => 'unknown', 'source' => 'inventory'], 'conductorCount' => 4, 'crossSectionMm2' => 6, 'voltageV' => 400];
        $this->postJson('/api/v1/admin/cables', $power, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/cables/power-extra')->assertOk()->assertJsonPath('data.kind', 'power')->assertJsonPath('data.conductorCount', 4)->assertJsonPath('data.status.source', 'inventory');
        self::assertSame(0, DB::table('fiber_cable_details')->where('map_id', 'test-map')->where('cable_id', 'power-extra')->count());
        self::assertSame(1, DB::table('power_cable_details')->where('map_id', 'test-map')->where('cable_id', 'power-extra')->count());
        $this->patchJson('/api/v1/admin/cables/power-extra', ['lengthM' => 50, 'conductorCount' => 5, 'status' => ['state' => 'active', 'source' => 'manual']], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/cables/power-extra')->assertOk()->assertJsonPath('data.lengthM', 50.0)->assertJsonPath('data.conductorCount', 5)->assertJsonPath('data.status.state', 'active');

        foreach ([
            [['fromSiteId' => 'missing-site'], 'REFERENCE'],
            [['code' => 'DEMO-PWR-01'], 'DUPLICATE_CODE'],
            [['totalCores' => 12], 'SCHEMA'],
            [['kind' => 'fiber'], 'SCHEMA'],
            [['conductorCount' => 0], 'SCHEMA'],
            [['crossSectionMm2' => 0], 'SCHEMA'],
            [['voltageV' => -1], 'SCHEMA'],
            [['status' => ['state' => 'active', 'source' => 'telemetry']], 'SCHEMA'],
            [['metadata' => ['notes' => 'unsupported']], 'SCHEMA'],
        ] as $i => [$fields, $code]) {
            $invalid = array_replace($power, ['id' => 'invalid-power-'.$i, 'code' => 'INVALID-POWER-'.$i], $fields);
            $before = $this->content();
            $this->postJson('/api/v1/admin/cables', $invalid, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertSame($before, $this->content());
        }
        $this->secondMap();
        $invalid = array_replace($power, ['id' => 'cross-map-power', 'code' => 'CROSS-MAP-POWER', 'fromSiteId' => 'only-b-site']);
        $response = $this->postJson('/api/v1/admin/cables', $invalid, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        self::assertStringNotContainsString('OTHER-MAP-MARKER', $response->getContent());

        foreach ([
            ['sourcePortId' => 'demo-sfp-01'],
            ['destinationPortId' => 'demo-sfp-04'],
            ['cableIds' => ['demo-fo-01']],
        ] as $fields) {
            $invalid = $this->content();
            $invalid['powerCircuits'][0] = array_replace($invalid['powerCircuits'][0], $fields);
            self::assertContains('REFERENCE', array_column($this->workflow->rules->inspect($invalid), 'code'));
        }
        $this->deleteJson('/api/v1/admin/cables/demo-power-01', [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->deleteJson('/api/v1/admin/ports/demo-terminal-01', [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');

        $content = $this->content();
        $content['layout']['edges'] = array_values(array_filter($content['layout']['edges'], fn ($edge) => !str_starts_with($edge['connectionType'], 'power_')));
        self::assertSame([], $this->workflow->rules->inspect($content, true));
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($content['powerCircuits'], $this->content()['powerCircuits']);
        self::assertSame($content['routes'], $this->content()['routes']);
        $this->deleteJson('/api/v1/admin/cables/power-extra', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/cables/power-extra')->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        self::assertSame(0, DB::table('power_cable_details')->where('map_id', 'test-map')->where('cable_id', 'power-extra')->count());
        self::assertSame(1, DB::table('power_cable_details')->where('map_id', 'test-map')->count());
    }

    public function test_power_circuit_path_supply_and_reference_validation(): void
    {
        $base = $this->content();
        $path = $base;
        $first = array_replace($base['cables'][3], ['id' => 'path-power-01', 'code' => 'PATH-POWER-01', 'fromSiteId' => 'demo-site-01', 'toSiteId' => 'demo-site-02']);
        $second = array_replace($first, ['id' => 'path-power-02', 'code' => 'PATH-POWER-02', 'fromSiteId' => 'demo-site-02', 'toSiteId' => 'demo-site-04']);
        $path['cables'] = array_merge($path['cables'], [$first, $second]);
        $path['powerCircuits'][0]['cableIds'] = ['path-power-01', 'path-power-02'];
        self::assertSame([], $this->workflow->rules->inspect($path, true));

        $backup = $path;
        $backup['powerCircuits'][0]['supplyType'] = 'backup';
        self::assertSame([], $this->workflow->rules->inspect($backup, true));
        $ups = $path;
        $ups['powerCircuits'][0] = array_replace($ups['powerCircuits'][0], ['sourcePortId' => 'demo-terminal-04', 'destinationPortId' => 'demo-terminal-01', 'supplyType' => 'ups', 'cableIds' => ['demo-power-01']]);
        self::assertSame([], $this->workflow->rules->inspect($ups, true));

        $wrongSource = $path;
        $wrongSource['powerCircuits'][0]['supplyType'] = 'ups';
        self::assertContains('POWER_SOURCE', array_column($this->workflow->rules->inspect($wrongSource, true), 'code'));
        $switchTerminal = array_replace($base['ports'][2], ['id' => 'switch-terminal', 'deviceId' => 'demo-switch-01']);
        $wrongSource = $path;
        $wrongSource['ports'][] = $switchTerminal;
        $wrongSource['powerCircuits'][0]['sourcePortId'] = 'switch-terminal';
        self::assertContains('POWER_SOURCE', array_column($this->workflow->rules->inspect($wrongSource, true), 'code'));
        $gap = $path;
        $gap['powerCircuits'][0]['cableIds'] = ['path-power-02', 'path-power-01'];
        self::assertContains('POWER_GAP', array_column($this->workflow->rules->inspect($gap, true), 'code'));
        $wrongDestination = $path;
        $wrongDestination['cables'][count($wrongDestination['cables']) - 1]['toSiteId'] = 'demo-site-03';
        self::assertContains('POWER_DESTINATION', array_column($this->workflow->rules->inspect($wrongDestination, true), 'code'));

        $this->secondMap();
        foreach ([
            [['sourcePortId' => 'only-b-port'], 'REFERENCE'],
            [['destinationPortId' => 'missing-port'], 'REFERENCE'],
            [['cableIds' => ['missing-cable']], 'REFERENCE'],
            [['cableIds' => ['demo-fo-01']], 'REFERENCE'],
            [['cableIds' => ['demo-power-01', 'demo-power-01']], 'SCHEMA'],
        ] as [$fields, $code]) {
            $invalid = $base;
            $invalid['powerCircuits'][0] = array_replace($invalid['powerCircuits'][0], $fields);
            self::assertContains($code, array_column($this->workflow->rules->inspect($invalid), 'code'));
        }
        $this->putJson('/api/v1/admin/map/draft', $path, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame(['path-power-01', 'path-power-02'], $this->content()['powerCircuits'][0]['cableIds']);
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->assertJsonPath('data.powerCircuits.0.cableIds.0', 'path-power-01')->assertJsonPath('data.powerCircuits.0.cableIds.1', 'path-power-02')->getContent();
        $inventory = [DB::table('cables')->where('map_id', 'test-map')->count(), DB::table('power_circuit_cables')->where('map_id', 'test-map')->count(), DB::table('corridor_cables')->where('map_id', 'test-map')->count()];
        $this->putJson('/api/v1/admin/map/draft', $gap, ['If-Match' => $this->etag()])->assertOk();
        $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $this->etag()])->assertOk()->assertJsonPath('data.valid', false);
        self::assertContains('POWER_GAP', array_column($validation->json('data.issues'), 'code'));
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertStatus(409)->assertJsonPath('error.code', 'VALIDATION_REQUIRED');
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        self::assertSame($inventory, [DB::table('cables')->where('map_id', 'test-map')->count(), DB::table('power_circuit_cables')->where('map_id', 'test-map')->count(), DB::table('corridor_cables')->where('map_id', 'test-map')->count()]);
    }

    public function test_power_circuit_api_lifecycle_and_visual_independence(): void
    {
        $base = $this->content();
        $circuit = array_replace($base['powerCircuits'][0], ['id' => 'extra-circuit', 'code' => 'EXTRA-CIRCUIT']);
        $this->postJson('/api/v1/admin/power-circuits', $circuit, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/power-circuits/extra-circuit')->assertOk()->assertJsonPath('data.cableIds.0', 'demo-power-01');
        $this->patchJson('/api/v1/admin/power-circuits/extra-circuit', ['supplyType' => 'backup'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/power-circuits/extra-circuit')->assertJsonPath('data.supplyType', 'backup');
        $before = $this->content();
        $this->secondMap();
        foreach ([
            ['sourcePortId' => 'only-b-port'],
            ['destinationPortId' => 'missing-port'],
            ['cableIds' => ['missing-cable']],
        ] as $fields) {
            $this->patchJson('/api/v1/admin/power-circuits/extra-circuit', $fields, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
            self::assertSame($before, $this->content());
        }
        $this->postJson('/api/v1/admin/power-circuits', array_replace($circuit, ['id' => 'duplicate-circuit']), ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'DUPLICATE_CODE');
        self::assertSame($before, $this->content());
        $this->deleteJson('/api/v1/admin/cables/demo-power-01', [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->deleteJson('/api/v1/admin/ports/demo-terminal-01', [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');

        $layout = $this->content();
        $layout['layout']['edges'] = array_values(array_filter($layout['layout']['edges'], fn ($edge) => !str_starts_with($edge['connectionType'], 'power_')));
        $this->putJson('/api/v1/admin/map/draft', $layout, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($before['powerCircuits'], $this->content()['powerCircuits']);
        self::assertSame($before['cables'], $this->content()['cables']);
        $this->deleteJson('/api/v1/admin/power-circuits/extra-circuit', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/power-circuits/extra-circuit')->assertNotFound();
        self::assertSame(0, DB::table('power_circuit_cables')->where('map_id', 'test-map')->where('circuit_id', 'extra-circuit')->count());
        self::assertCount(1, $this->content()['powerCircuits']);
    }

    public function test_route_corridor_membership_lifecycle_and_visual_independence(): void
    {
        $base = $this->content();
        self::assertSame(['demo-fo-01', 'demo-power-01'], $base['routes'][0]['cableIds']);
        $power = array_replace($base['cables'][3], ['id' => 'route-only-power', 'code' => 'ROUTE-ONLY-POWER']);
        $this->postJson('/api/v1/admin/cables', $power, ['If-Match' => $this->etag()])->assertCreated();
        $route = ['id' => 'shared-route', 'code' => 'SHARED-ROUTE', 'name' => 'Shared FO and Power', 'cableIds' => ['route-only-power', 'demo-fo-01']];
        $this->postJson('/api/v1/admin/route-corridors', $route, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/route-corridors/shared-route')->assertOk()->assertJsonPath('data.cableIds', ['demo-fo-01', 'route-only-power']);
        $this->patchJson('/api/v1/admin/route-corridors/shared-route', ['cableIds' => ['route-only-power']], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/route-corridors/shared-route')->assertJsonPath('data.cableIds', ['route-only-power']);
        $this->patchJson('/api/v1/admin/route-corridors/shared-route', ['cableIds' => $route['cableIds']], ['If-Match' => $this->etag()])->assertOk();

        $other = $this->secondMap();
        $other['cables'][] = array_replace($power, ['id' => 'only-b-cable', 'code' => 'ONLY-B-CABLE', 'fromSiteId' => 'only-b-site', 'toSiteId' => 'demo-site-01']);
        $this->workflow->store->replace($this->workflow->map('other-map'), $other);
        $before = $this->content();
        foreach ([
            [['cableIds' => ['only-b-cable']], 'REFERENCE'],
            [['cableIds' => ['missing-cable']], 'REFERENCE'],
            [['cableIds' => ['demo-fo-01', 'demo-fo-01']], 'SCHEMA'],
            [['cableIds' => []], 'SCHEMA'],
            [['status' => ['state' => 'active']], 'SCHEMA'],
        ] as [$fields, $code]) {
            $response = $this->patchJson('/api/v1/admin/route-corridors/shared-route', $fields, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertStringNotContainsString('ONLY-B-CABLE', $response->getContent());
            self::assertSame($before, $this->content());
        }
        $this->postJson('/api/v1/admin/route-corridors', array_replace($route, ['id' => 'duplicate-route']), ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'DUPLICATE_CODE');
        $this->getJson('/api/v1/admin/route-corridors/missing-route')->assertNotFound();
        $this->getJson('/api/v1/admin/route-corridors/shared-route?mapId=other-map')->assertNotFound();
        $this->deleteJson('/api/v1/admin/cables/route-only-power', [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');

        $layout = $this->content();
        $layout['layout']['edges'] = [];
        $this->putJson('/api/v1/admin/map/draft', $layout, ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($before['routes'], $this->content()['routes']);
        self::assertSame($before['cables'], $this->content()['cables']);
        $this->publish();
        $this->viewerMap()->assertOk()->assertJsonPath('data.routes.1.cableIds', ['demo-fo-01', 'route-only-power']);
        $this->deleteJson('/api/v1/admin/route-corridors/shared-route', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/route-corridors/shared-route')->assertNotFound();
        self::assertSame(0, DB::table('corridor_cables')->where('map_id', 'test-map')->where('corridor_id', 'shared-route')->count());
        $this->deleteJson('/api/v1/admin/cables/route-only-power', [], ['If-Match' => $this->etag()])->assertOk();
        self::assertCount(1, $this->content()['routes']);
    }

    public function test_fo_core_number_capacity_and_duplicate_on_create_update(): void
    {
        $core = ['id' => 'boundary-core', 'cableId' => 'demo-fo-01', 'coreNumber' => 12, 'status' => 'unallocated'];
        $this->postJson('/api/v1/admin/fiber-cores', $core, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/fiber-cores/boundary-core')->assertOk()->assertJsonPath('data.coreNumber', 12);

        foreach ([0 => 'SCHEMA', -1 => 'SCHEMA', 13 => 'CORE_CAPACITY', 1 => 'DUPLICATE_CORE'] as $number => $code) {
            $before = $this->content();
            $this->patchJson('/api/v1/admin/fiber-cores/boundary-core', ['coreNumber' => $number], ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertSame($before, $this->content());
        }
        foreach ([0 => 'SCHEMA', 13 => 'CORE_CAPACITY', 1 => 'DUPLICATE_CORE'] as $number => $code) {
            $before = $this->content();
            $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'rejected-core', 'cableId' => 'demo-fo-01', 'coreNumber' => $number, 'status' => 'unallocated'], ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertSame($before, $this->content());
        }
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'same-number-other-cable', 'cableId' => 'demo-fo-02', 'coreNumber' => 12, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        $before = $this->content();
        $this->patchJson('/api/v1/admin/cables/demo-fo-01', ['totalCores' => 11], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'CORE_CAPACITY');
        self::assertSame($before, $this->content());
        $this->patchJson('/api/v1/admin/fiber-cores/boundary-core', ['coreNumber' => 11], ['If-Match' => $this->etag()])->assertOk();
        $this->patchJson('/api/v1/admin/cables/demo-fo-01', ['totalCores' => 11], ['If-Match' => $this->etag()])->assertOk();
        $this->patchJson('/api/v1/admin/cables/demo-fo-01', ['totalCores' => 6912], ['If-Match' => $this->etag()])->assertOk();
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'max-core', 'cableId' => 'demo-fo-01', 'coreNumber' => 6912, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'over-max-core', 'cableId' => 'demo-fo-01', 'coreNumber' => 6913, 'status' => 'unallocated'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'CORE_CAPACITY');
    }

    public function test_fo_core_map_scope_and_immutable_identity(): void
    {
        $this->secondMap();
        DB::table('cables')->insert(['map_id' => 'other-map', 'id' => 'only-b-cable', 'code' => 'ONLY-B-CABLE', 'kind' => 'fiber', 'from_site_id' => 'only-b-site', 'to_site_id' => 'demo-site-01', 'length_m' => 1, 'status' => '{}']);
        DB::table('fiber_cable_details')->insert(['map_id' => 'other-map', 'cable_id' => 'only-b-cable', 'total_cores' => 12, 'fiber_type' => 'single_mode']);
        DB::table('fiber_cores')->insert(['map_id' => 'other-map', 'id' => 'only-b-core', 'cable_id' => 'only-b-cable', 'core_number' => 1]);
        try { DB::table('fiber_cores')->insert(['map_id' => 'test-map', 'id' => 'cross-map-core', 'cable_id' => 'only-b-cable', 'core_number' => 1]); self::fail('Cross-map FK must reject core.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1452, $error->errorInfo[1]); }
        try { DB::table('fiber_cores')->insert(['map_id' => 'test-map', 'id' => 'duplicate-number-core', 'cable_id' => 'demo-fo-01', 'core_number' => 1]); self::fail('Cable core number must be unique.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1062, $error->errorInfo[1]); }

        $before = $this->content();
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'cross-map-core', 'cableId' => 'only-b-cable', 'coreNumber' => 1, 'status' => 'unallocated'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'CORE_CAPACITY');
        $this->patchJson('/api/v1/admin/fiber-cores/demo-core-01', ['cableId' => 'only-b-cable'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'CORE_CAPACITY');
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'scope-override-core', 'mapId' => 'other-map', 'cableId' => 'demo-fo-01', 'coreNumber' => 2, 'status' => 'unallocated'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
        $this->patchJson('/api/v1/admin/fiber-cores/demo-core-01', ['id' => 'renamed'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'IMMUTABLE_ID');
        self::assertSame($before, $this->content());
        $this->getJson('/api/v1/admin/fiber-cores/only-b-core?mapId=other-map')->assertOk()->assertJsonPath('data.cableId', 'only-b-cable');
        $this->getJson('/api/v1/admin/fiber-cores/only-b-core?mapId=test-map')->assertNotFound();
    }

    public function test_fo_core_faulty_inventory_and_operational_path_eligibility(): void
    {
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'faulty-spare', 'cableId' => 'demo-fo-01', 'coreNumber' => 2, 'status' => 'faulty'], ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/fiber-cores/faulty-spare')->assertOk()->assertJsonPath('data.status', 'faulty');
        self::assertSame('faulty', DB::table('fiber_cores')->where('map_id', 'test-map')->where('id', 'faulty-spare')->value('condition'));
        $revision = $this->publish();
        $this->viewerMap()->assertOk()->assertJsonPath('data.fiberCores.3.status', 'faulty');

        $this->patchJson('/api/v1/admin/fiber-cores/demo-core-01', ['status' => 'faulty'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/fiber-cores/demo-core-01')->assertOk()->assertJsonPath('data.status', 'faulty');
        $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $this->etag()])->assertOk();
        self::assertFalse($validation->json('data.valid'));
        self::assertContains('CORE_UNAVAILABLE', array_column($validation->json('data.issues'), 'code'));
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertStatus(409);
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
    }

    public function test_fo_termination_valid_update_delete_and_faulty_inventory(): void
    {
        $status = ['state' => 'unknown', 'source' => 'inventory'];
        $this->postJson('/api/v1/admin/devices', ['id' => 'term-otb', 'siteId' => 'demo-site-02', 'code' => 'TERM-OTB', 'type' => 'otb', 'status' => $status], ['If-Match' => $this->etag()])->assertCreated();
        foreach (['term-b1', 'term-b2'] as $id) {
            $this->postJson('/api/v1/admin/ports', ['id' => $id, 'deviceId' => 'term-otb', 'name' => $id, 'type' => 'fiber', 'status' => $status], ['If-Match' => $this->etag()])->assertCreated();
        }
        $this->postJson('/api/v1/admin/ports', ['id' => 'term-a1', 'deviceId' => 'demo-switch-01', 'name' => 'TERM A1', 'type' => 'fiber', 'status' => $status], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'term-core', 'cableId' => 'demo-fo-01', 'coreNumber' => 2, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-terminations', ['id' => 'term-new-b', 'fiberCoreId' => 'term-core', 'portId' => 'term-b1', 'endSide' => 'b'], ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/fiber-terminations/term-new-b')->assertOk()->assertJsonPath('data.portId', 'term-b1');
        $this->patchJson('/api/v1/admin/fiber-terminations/term-new-b', ['portId' => 'term-b2'], ['If-Match' => $this->etag()])->assertOk();
        $this->postJson('/api/v1/admin/fiber-terminations', ['id' => 'term-new-a', 'fiberCoreId' => 'term-core', 'portId' => 'term-a1', 'endSide' => 'a'], ['If-Match' => $this->etag()])->assertCreated();
        self::assertSame(2, DB::table('fiber_terminations')->where('map_id', 'test-map')->where('fiber_core_id', 'term-core')->count());

        $this->patchJson('/api/v1/admin/fiber-cores/term-core', ['status' => 'faulty'], ['If-Match' => $this->etag()])->assertOk();
        self::assertSame(2, DB::table('fiber_terminations')->where('map_id', 'test-map')->where('fiber_core_id', 'term-core')->count());
        $content = $this->content();
        $content['layout']['edges'] = [];
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
        $revision = $this->publish();
        self::assertSame(2, DB::table('fiber_terminations')->where('map_id', 'test-map')->where('fiber_core_id', 'term-core')->count());

        $this->deleteJson('/api/v1/admin/fiber-cores/term-core', [], ['If-Match' => $this->etag()])->assertStatus(422);
        $this->deleteJson('/api/v1/admin/ports/term-b2', [], ['If-Match' => $this->etag()])->assertStatus(422);
        try { DB::table('fiber_cores')->where('map_id', 'test-map')->where('id', 'term-core')->delete(); self::fail('Referenced core must not be deleted.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1451, $error->errorInfo[1]); }
        try { DB::table('device_ports')->where('map_id', 'test-map')->where('id', 'term-b2')->delete(); self::fail('Referenced port must not be deleted.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1451, $error->errorInfo[1]); }
        $this->deleteJson('/api/v1/admin/fiber-terminations/term-new-b', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/fiber-terminations/term-new-b')->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        $this->deleteJson('/api/v1/admin/fiber-terminations/term-new-a', [], ['If-Match' => $this->etag()])->assertOk();
        $this->deleteJson('/api/v1/admin/fiber-cores/term-core', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/fiber-cores/term-core')->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        self::assertSame(0, DB::table('fiber_terminations')->where('map_id', 'test-map')->where('fiber_core_id', 'term-core')->count());
        self::assertSame(1, DB::table('device_ports')->where('map_id', 'test-map')->where('id', 'term-b2')->count());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
    }

    public function test_fo_termination_rejects_invalid_core_port_side_and_duplicate(): void
    {
        foreach ([
            [['fiberCoreId' => 'missing-core'], 'REFERENCE'],
            [['portId' => 'missing-port'], 'REFERENCE'],
            [['portId' => 'demo-terminal-01'], 'REFERENCE'],
            [['portId' => 'demo-sfp-04'], 'WRONG_END'],
            [['endSide' => 'b'], 'WRONG_END'],
            [['endSide' => 'c'], 'SCHEMA'],
        ] as [$patch, $code]) {
            $before = $this->content();
            $this->patchJson('/api/v1/admin/fiber-terminations/demo-term-01', $patch, ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertSame($before, $this->content());
        }
        $before = $this->content();
        $this->postJson('/api/v1/admin/fiber-terminations', ['id' => 'duplicate-end', 'fiberCoreId' => 'demo-core-01', 'portId' => 'demo-sfp-01', 'endSide' => 'a'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'END_CONFLICT');
        self::assertSame($before, $this->content());
        try { DB::table('fiber_terminations')->insert(['map_id' => 'test-map', 'id' => 'db-duplicate-end', 'fiber_core_id' => 'demo-core-01', 'port_id' => 'demo-sfp-01', 'end_side' => 'a']); self::fail('Core end must be unique.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1062, $error->errorInfo[1]); }
        try { DB::table('fiber_terminations')->insert(['map_id' => 'test-map', 'id' => 'db-missing-port', 'fiber_core_id' => 'demo-core-01', 'port_id' => 'missing-port', 'end_side' => 'b']); self::fail('Port FK must reject orphan.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1452, $error->errorInfo[1]); }
        try { DB::table('fiber_terminations')->insert(['map_id' => 'test-map', 'id' => 'db-missing-core', 'fiber_core_id' => 'missing-core', 'port_id' => 'demo-sfp-01', 'end_side' => 'b']); self::fail('Core FK must reject orphan.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1452, $error->errorInfo[1]); }
    }

    public function test_fo_termination_cross_map_core_port_and_api_scope(): void
    {
        $this->secondMap();
        DB::table('cables')->insert(['map_id' => 'other-map', 'id' => 'only-b-cable', 'code' => 'ONLY-B-CABLE', 'kind' => 'fiber', 'from_site_id' => 'only-b-site', 'to_site_id' => 'demo-site-01', 'length_m' => 1, 'status' => '{}']);
        DB::table('fiber_cable_details')->insert(['map_id' => 'other-map', 'cable_id' => 'only-b-cable', 'total_cores' => 2, 'fiber_type' => 'single_mode']);
        DB::table('fiber_cores')->insert(['map_id' => 'other-map', 'id' => 'only-b-core', 'cable_id' => 'only-b-cable', 'core_number' => 1]);
        DB::table('fiber_terminations')->insert(['map_id' => 'other-map', 'id' => 'only-b-term', 'fiber_core_id' => 'only-b-core', 'port_id' => 'only-b-port', 'end_side' => 'a']);

        foreach ([
            ['db-cross-port', 'demo-core-01', 'only-b-port'],
            ['db-cross-core', 'only-b-core', 'demo-sfp-01'],
        ] as [$id, $core, $port]) {
            try { DB::table('fiber_terminations')->insert(['map_id' => 'test-map', 'id' => $id, 'fiber_core_id' => $core, 'port_id' => $port, 'end_side' => 'b']); self::fail('Cross-map FK must reject termination.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame(1452, $error->errorInfo[1]); }
        }
        $before = $this->content();
        foreach ([['portId' => 'only-b-port'], ['fiberCoreId' => 'only-b-core']] as $patch) {
            $this->patchJson('/api/v1/admin/fiber-terminations/demo-term-01', $patch, ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        }
        $this->postJson('/api/v1/admin/fiber-terminations', ['id' => 'cross-map-term', 'fiberCoreId' => 'demo-core-01', 'portId' => 'only-b-port', 'endSide' => 'b'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->postJson('/api/v1/admin/fiber-terminations', ['id' => 'scope-override-term', 'mapId' => 'other-map', 'fiberCoreId' => 'demo-core-01', 'portId' => 'demo-sfp-01', 'endSide' => 'b'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
        self::assertSame($before, $this->content());
        $this->getJson('/api/v1/admin/fiber-terminations/only-b-term?mapId=other-map')->assertOk()->assertJsonPath('data.portId', 'only-b-port');
        $this->getJson('/api/v1/admin/fiber-terminations/only-b-term?mapId=test-map')->assertNotFound();
    }

    public function test_fo_splice_valid_update_delete_faulty_and_visual_separation(): void
    {
        foreach (['splice-a' => 'demo-fo-01', 'splice-b' => 'demo-fo-02'] as $id => $cable) {
            $this->postJson('/api/v1/admin/fiber-cores', ['id' => $id, 'cableId' => $cable, 'coreNumber' => 2, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        }
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'splice-b2', 'cableId' => 'demo-fo-02', 'coreNumber' => 3, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        $splice = ['id' => 'splice-new', 'fromFiberCoreId' => 'splice-a', 'toFiberCoreId' => 'splice-b', 'closureDeviceId' => 'demo-closure-02'];
        $this->postJson('/api/v1/admin/fiber-splices', $splice, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/fiber-splices/splice-new')->assertOk()->assertJsonPath('data.toFiberCoreId', 'splice-b');
        $this->patchJson('/api/v1/admin/fiber-splices/splice-new', ['toFiberCoreId' => 'splice-b2'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/fiber-splices/splice-new')->assertOk()->assertJsonPath('data.toFiberCoreId', 'splice-b2');
        $this->patchJson('/api/v1/admin/fiber-cores/splice-a', ['status' => 'faulty'], ['If-Match' => $this->etag()])->assertOk();
        self::assertSame(1, DB::table('fiber_splices')->where('map_id', 'test-map')->where('id', 'splice-new')->count());
        $content = $this->content();
        $content['layout']['edges'] = [];
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
        $revision = $this->publish();
        self::assertSame(1, DB::table('fiber_splices')->where('map_id', 'test-map')->where('id', 'splice-new')->count());
        $this->deleteJson('/api/v1/admin/fiber-cores/splice-a', [], ['If-Match' => $this->etag()])->assertStatus(422);
        $this->deleteJson('/api/v1/admin/devices/demo-closure-02', [], ['If-Match' => $this->etag()])->assertStatus(422);
        try { DB::table('fiber_cores')->where('map_id', 'test-map')->where('id', 'splice-a')->delete(); self::fail('Referenced core must not be deleted.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1451, $error->errorInfo[1]); }
        $this->deleteJson('/api/v1/admin/fiber-splices/splice-new', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/fiber-splices/splice-new')->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        self::assertSame(0, DB::table('fiber_splices')->where('map_id', 'test-map')->where('id', 'splice-new')->count());
        self::assertSame(1, DB::table('fiber_cores')->where('map_id', 'test-map')->where('id', 'splice-a')->count());
        self::assertSame(1, DB::table('cables')->where('map_id', 'test-map')->where('id', 'demo-fo-01')->count());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
    }

    public function test_fo_splice_rejects_invalid_endpoints_duplicate_reverse_and_ambiguity(): void
    {
        foreach ([
            [['fromFiberCoreId' => 'missing-core'], 'REFERENCE'],
            [['toFiberCoreId' => 'missing-core'], 'REFERENCE'],
            [['toFiberCoreId' => 'demo-core-01'], 'REFERENCE'],
            [['closureDeviceId' => 'missing-closure'], 'REFERENCE'],
            [['closureDeviceId' => 'demo-switch-01'], 'REFERENCE'],
            [['closureDeviceId' => 'demo-closure-03'], 'SPLICE_END'],
        ] as [$patch, $code]) {
            $before = $this->content();
            $this->patchJson('/api/v1/admin/fiber-splices/demo-splice-02', $patch, ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertSame($before, $this->content());
        }
        foreach ([['demo-core-01', 'demo-core-02'], ['demo-core-02', 'demo-core-01']] as [$from, $to]) {
            $before = $this->content();
            $this->postJson('/api/v1/admin/fiber-splices', ['id' => 'duplicate-splice', 'fromFiberCoreId' => $from, 'toFiberCoreId' => $to, 'closureDeviceId' => 'demo-closure-02'], ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', 'END_CONFLICT');
            self::assertSame($before, $this->content());
        }
        $this->patchJson('/api/v1/admin/fiber-splices/demo-splice-03', ['fromFiberCoreId' => 'demo-core-01', 'toFiberCoreId' => 'demo-core-02', 'closureDeviceId' => 'demo-closure-02'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'END_CONFLICT');
        $status = ['state' => 'unknown', 'source' => 'inventory'];
        $this->postJson('/api/v1/admin/devices', ['id' => 'collision-closure', 'siteId' => 'demo-site-01', 'code' => 'COLLISION-CLOSURE', 'type' => 'splice_closure', 'status' => $status], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'collision-core', 'cableId' => 'demo-fo-01', 'coreNumber' => 2, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-splices', ['id' => 'collision-splice', 'fromFiberCoreId' => 'demo-core-01', 'toFiberCoreId' => 'collision-core', 'closureDeviceId' => 'collision-closure'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'END_CONFLICT');

        $this->postJson('/api/v1/admin/cables', ['id' => 'loop-cable', 'code' => 'LOOP-CABLE', 'kind' => 'fiber', 'fromSiteId' => 'demo-site-02', 'toSiteId' => 'demo-site-02', 'lengthM' => 1, 'status' => $status, 'totalCores' => 1, 'fiberType' => 'single_mode'], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-cores', ['id' => 'loop-core', 'cableId' => 'loop-cable', 'coreNumber' => 1, 'status' => 'unallocated'], ['If-Match' => $this->etag()])->assertCreated();
        $this->postJson('/api/v1/admin/fiber-splices', ['id' => 'ambiguous-splice', 'fromFiberCoreId' => 'loop-core', 'toFiberCoreId' => 'collision-core', 'closureDeviceId' => 'demo-closure-02'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'SPLICE_END');
    }

    public function test_fo_splice_cross_map_core_closure_and_api_scope(): void
    {
        $this->secondMap();
        DB::table('devices')->where('map_id', 'other-map')->where('id', 'only-b-device')->update(['type' => 'splice_closure']);
        DB::table('cables')->insert(['map_id' => 'other-map', 'id' => 'only-b-cable', 'code' => 'ONLY-B-CABLE', 'kind' => 'fiber', 'from_site_id' => 'only-b-site', 'to_site_id' => 'demo-site-01', 'length_m' => 1, 'status' => '{}']);
        DB::table('fiber_cable_details')->insert(['map_id' => 'other-map', 'cable_id' => 'only-b-cable', 'total_cores' => 2, 'fiber_type' => 'single_mode']);
        foreach (['only-b-core-1' => 1, 'only-b-core-2' => 2] as $id => $number) {
            DB::table('fiber_cores')->insert(['map_id' => 'other-map', 'id' => $id, 'cable_id' => 'only-b-cable', 'core_number' => $number]);
        }
        DB::table('fiber_splices')->insert(['map_id' => 'other-map', 'id' => 'only-b-splice', 'from_fiber_core_id' => 'only-b-core-1', 'to_fiber_core_id' => 'only-b-core-2', 'closure_device_id' => 'only-b-device']);

        foreach ([
            ['only-b-core-1', 'demo-core-02', 'demo-closure-02'],
            ['demo-core-01', 'only-b-core-2', 'demo-closure-02'],
            ['demo-core-01', 'demo-core-02', 'only-b-device'],
        ] as $index => [$from, $to, $closure]) {
            try { DB::table('fiber_splices')->insert(['map_id' => 'test-map', 'id' => 'cross-map-'.$index, 'from_fiber_core_id' => $from, 'to_fiber_core_id' => $to, 'closure_device_id' => $closure]); self::fail('Cross-map FK must reject splice.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame(1452, $error->errorInfo[1]); }
        }
        $before = $this->content();
        foreach ([['fromFiberCoreId' => 'only-b-core-1'], ['toFiberCoreId' => 'only-b-core-2'], ['closureDeviceId' => 'only-b-device']] as $patch) {
            $this->patchJson('/api/v1/admin/fiber-splices/demo-splice-02', $patch, ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        }
        $this->postJson('/api/v1/admin/fiber-splices', ['id' => 'cross-map-splice', 'fromFiberCoreId' => 'only-b-core-1', 'toFiberCoreId' => 'demo-core-02', 'closureDeviceId' => 'demo-closure-02'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->postJson('/api/v1/admin/fiber-splices', ['id' => 'scope-override-splice', 'mapId' => 'other-map', 'fromFiberCoreId' => 'demo-core-01', 'toFiberCoreId' => 'demo-core-02', 'closureDeviceId' => 'demo-closure-02'], ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
        self::assertSame($before, $this->content());
        $this->getJson('/api/v1/admin/fiber-splices/only-b-splice?mapId=other-map')->assertOk()->assertJsonPath('data.closureDeviceId', 'only-b-device');
        $this->getJson('/api/v1/admin/fiber-splices/only-b-splice?mapId=test-map')->assertNotFound();
    }

    public function test_crud_pagination_and_referential_delete_rejection(): void
    {
        $site = ['id' => 'extra', 'code' => 'DEMO-EXTRA', 'name' => 'DEMO Extra', 'type' => 'field_site', 'status' => ['state' => 'unknown', 'source' => 'inventory']];
        $this->postJson('/api/v1/admin/sites', $site, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson('/api/v1/admin/sites?page=2&perPage=5')->assertOk()->assertJsonPath('meta.total', 9)->assertJsonCount(4, 'data');
        $this->patchJson('/api/v1/admin/sites/extra', ['name' => 'Changed'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/sites/extra')->assertOk()->assertJsonPath('data.name', 'Changed');
        $this->deleteJson('/api/v1/admin/sites/demo-site-01', [], ['If-Match' => $this->etag()])->assertStatus(422);
        $this->deleteJson('/api/v1/admin/sites/extra', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/sites/extra')->assertNotFound();
        self::assertGreaterThanOrEqual(3, DB::table('audit_logs')->where('map_id', 'test-map')->count());
    }

    public function test_site_device_port_crud_and_published_snapshot_stays_immutable(): void
    {
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->getContent();
        $base = $this->content();
        $site = array_replace($base['sites'][0], ['id' => 'crud-site', 'code' => 'CRUD-SITE', 'name' => 'CRUD Site']);
        $device = array_replace($base['devices'][0], ['id' => 'crud-device', 'code' => 'CRUD-DEVICE', 'siteId' => 'crud-site']);
        $port = array_replace($base['ports'][0], ['id' => 'crud-port', 'deviceId' => 'crud-device', 'name' => 'CRUD Port']);
        foreach ([['sites', $site, 'name'], ['devices', $device, 'model'], ['ports', $port, 'name']] as [$resource, $row, $field]) {
            $url = '/api/v1/admin/'.$resource;
            $before = $this->getJson($url.'?perPage=1')->assertOk()->json('meta.total');
            $this->postJson($url, $row, ['If-Match' => $this->etag()])->assertCreated()
                ->assertJsonPath('data.content.'.$resource, array_values($this->content()[$resource]));
            $this->getJson($url.'?page=1&perPage=100')->assertOk()->assertJsonPath('meta.total', $before + 1);
            $this->getJson($url.'/'.$row['id'])->assertOk()->assertJsonPath('data.id', $row['id']);
            $this->patchJson($url.'/'.$row['id'], [$field => 'CRUD changed'], ['If-Match' => $this->etag()])->assertOk();
            $this->getJson($url.'/'.$row['id'])->assertOk()->assertJsonPath('data.'.$field, 'CRUD changed');
        }
        foreach (['ports' => 'crud-port', 'devices' => 'crud-device', 'sites' => 'crud-site'] as $resource => $id) {
            $url = '/api/v1/admin/'.$resource.'/'.$id;
            $this->deleteJson($url, [], ['If-Match' => $this->etag()])->assertOk();
            $this->getJson($url)->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        }
        self::assertSame($base, $this->content());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        foreach (['sites', 'devices', 'ports'] as $resource) {
            foreach (['post', 'patch', 'delete'] as $method) {
                self::assertSame(1, DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'inventory.'.$method.'.'.$resource)->count());
            }
        }
    }

    public function test_site_device_port_invalid_mutations_and_referential_delete_roll_back(): void
    {
        $other = $this->secondMap();
        $base = $this->draft();
        foreach (['sites', 'devices', 'ports'] as $resource) {
            $url = '/api/v1/admin/'.$resource;
            $row = $base['content'][$resource][0];
            $id = $row['id'];
            $cases = [
                [$url, array_diff_key($row, ['id' => true]), 'SCHEMA'],
                [$url, array_replace($row, ['id' => 'bad-'.$resource, 'status' => 'invalid']), 'SCHEMA'],
                [$url, $row, 'DUPLICATE_ID'],
                [$url.'/'.$id, ['missingField' => true], 'SCHEMA'],
            ];
            if ($resource === 'sites') $cases[] = [$url, array_replace($row, ['id' => 'duplicate-site', 'name' => 'duplicate']), 'DUPLICATE_CODE'];
            if ($resource === 'devices') {
                $cases[] = [$url, array_replace($row, ['id' => 'duplicate-device']), 'DUPLICATE_CODE'];
                $cases[] = [$url, array_replace($row, ['id' => 'orphan-device', 'code' => 'ORPHAN-DEVICE', 'siteId' => 'missing-site']), 'REFERENCE'];
                $cases[] = [$url, array_replace($row, ['id' => 'cross-device', 'code' => 'CROSS-DEVICE', 'siteId' => 'only-b-site']), 'REFERENCE'];
            }
            if ($resource === 'ports') {
                $cases[] = [$url, array_replace($row, ['id' => 'orphan-port', 'name' => 'Orphan port', 'deviceId' => 'missing-device']), 'REFERENCE'];
                $cases[] = [$url, array_replace($row, ['id' => 'cross-port', 'name' => 'Cross port', 'deviceId' => 'only-b-device']), 'REFERENCE'];
                $cases[] = [$url, array_replace($row, ['id' => 'duplicate-port']), 'DUPLICATE_PORT'];
            }
            foreach ($cases as [$path, $payload, $code]) {
                $response = $path === $url ? $this->postJson($path, $payload, ['If-Match' => $this->etag()]) : $this->patchJson($path, $payload, ['If-Match' => $this->etag()]);
                $response->assertStatus(422)->assertJsonPath('error.code', $code);
                self::assertSame($base, $this->draft());
            }
            $this->patchJson($url.'/missing-'.$resource, ['name' => 'x'], ['If-Match' => $this->etag()])->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
            $this->deleteJson($url.'/missing-'.$resource, [], ['If-Match' => $this->etag()])->assertNotFound();
        }
        foreach ([['sites', 'demo-site-01'], ['devices', 'demo-switch-01'], ['ports', 'demo-sfp-01']] as [$resource, $id]) {
            $this->deleteJson('/api/v1/admin/'.$resource.'/'.$id, [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
            self::assertSame($base, $this->draft());
        }
        self::assertEquals($other, $this->workflow->store->content($this->workflow->map('other-map')));
        $ungranted = User::create(['id' => (string) Str::uuid(), 'email' => 'ungranted@example.invalid', 'name' => 'Ungranted editor', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        $this->withSession(['admin_id' => $ungranted->id, '_token' => $this->csrf]);
        foreach (['sites' => 'demo-site-01', 'devices' => 'demo-switch-01', 'ports' => 'demo-sfp-01'] as $resource => $id) {
            $url = '/api/v1/admin/'.$resource;
            $this->postJson($url, ['id' => 'denied'], ['If-Match' => '"draft:'.$base['version'].'"'])->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
            $this->patchJson($url.'/'.$id, ['name' => 'denied'], ['If-Match' => '"draft:'.$base['version'].'"'])->assertForbidden();
            $this->deleteJson($url.'/'.$id, [], ['If-Match' => '"draft:'.$base['version'].'"'])->assertForbidden();
            $this->getJson($url.'?mapId=other-map')->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
            $this->getJson($url.'?mapId=absent-map')->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
        }
        self::assertSame($base['content'], $this->workflow->store->content($this->workflow->map('test-map')));
        self::assertEquals($other, $this->workflow->store->content($this->workflow->map('other-map')));
    }

    public function test_site_device_port_database_restricts_orphans_and_duplicate_keys(): void
    {
        $siteCode = DB::table('sites')->where('map_id', 'test-map')->where('id', 'demo-site-01')->value('code');
        $deviceCode = DB::table('devices')->where('map_id', 'test-map')->where('id', 'demo-switch-01')->value('code');
        $port = DB::table('device_ports')->where('map_id', 'test-map')->where('id', 'demo-sfp-01')->first();
        foreach ([
            [fn () => DB::table('sites')->where('map_id', 'test-map')->where('id', 'demo-site-02')->update(['code' => $siteCode]), 1062],
            [fn () => DB::table('devices')->where('map_id', 'test-map')->where('id', 'demo-closure-02')->update(['code' => $deviceCode]), 1062],
            [fn () => DB::table('device_ports')->insert(['map_id' => 'test-map', 'id' => 'duplicate-db-port', 'device_id' => $port->device_id, 'name' => $port->name, 'type' => $port->type, 'status' => $port->status, 'created_at' => now(), 'updated_at' => now()]), 1062],
            [fn () => DB::table('devices')->where('map_id', 'test-map')->where('id', 'demo-switch-01')->update(['site_id' => 'missing-site']), 1452],
            [fn () => DB::table('device_ports')->where('map_id', 'test-map')->where('id', 'demo-sfp-01')->update(['device_id' => 'missing-device']), 1452],
            [fn () => DB::table('sites')->where('map_id', 'test-map')->where('id', 'demo-site-01')->delete(), 1451],
            [fn () => DB::table('devices')->where('map_id', 'test-map')->where('id', 'demo-switch-01')->delete(), 1451],
            [fn () => DB::table('device_ports')->where('map_id', 'test-map')->where('id', 'demo-sfp-01')->delete(), 1451],
        ] as [$operation, $errorCode]) {
            try { $operation(); self::fail('Database must reject invalid inventory mutation.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame($errorCode, $error->errorInfo[1]); }
        }
        foreach (['devices' => ['sites', 'site_id'], 'device_ports' => ['devices', 'device_id']] as $table => [$parent, $field]) {
            self::assertSame(0, DB::table($table.' as child')->leftJoin($parent.' as parent', fn ($join) => $join->on('child.map_id', '=', 'parent.map_id')->on('child.'.$field, '=', 'parent.id'))->whereNull('parent.id')->count());
        }
    }

    public function test_logical_link_http_crud_and_physical_path_integrity(): void
    {
        $base = $this->content();
        foreach (['a' => 'demo-site-01', 'b' => 'demo-site-02'] as $side => $siteId) {
            $device = array_replace($base['devices'][0], ['id' => 'link-device-'.$side, 'code' => 'LINK-DEVICE-'.$side, 'siteId' => $siteId, 'type' => 'otb']);
            $port = array_replace($base['ports'][0], ['id' => 'link-port-'.$side, 'deviceId' => $device['id'], 'name' => 'Link port '.$side]);
            $this->postJson('/api/v1/admin/devices', $device, ['If-Match' => $this->etag()])->assertCreated();
            $this->postJson('/api/v1/admin/ports', $port, ['If-Match' => $this->etag()])->assertCreated();
        }
        $core = ['id' => 'link-core', 'cableId' => 'demo-fo-01', 'coreNumber' => 2, 'status' => 'unallocated'];
        $this->postJson('/api/v1/admin/fiber-cores', $core, ['If-Match' => $this->etag()])->assertCreated();
        foreach (['a', 'b'] as $side) {
            $term = ['id' => 'link-term-'.$side, 'fiberCoreId' => 'link-core', 'portId' => 'link-port-'.$side, 'endSide' => $side];
            $this->postJson('/api/v1/admin/fiber-terminations', $term, ['If-Match' => $this->etag()])->assertCreated();
        }
        $link = ['id' => 'link-crud', 'code' => 'LINK-CRUD', 'fromPortId' => 'link-port-a', 'toPortId' => 'link-port-b', 'routeName' => 'fo_ring_b', 'coreSegments' => ['link-core']];
        $url = '/api/v1/admin/logical-links';
        $before = $this->getJson($url.'?perPage=1')->assertOk()->json('meta.total');
        $this->postJson($url, $link, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson($url.'?page=2&perPage=1')->assertOk()->assertJsonPath('meta.total', $before + 1)->assertJsonPath('data.0.id', 'link-crud');
        $this->getJson($url.'/link-crud')->assertOk()->assertJsonPath('data.coreSegments.0', 'link-core');
        self::assertSame('allocated', $this->getJson('/api/v1/admin/fiber-cores/link-core')->assertOk()->json('data.status'));
        $this->patchJson($url.'/link-crud', ['code' => 'LINK-CRUD-CHANGED'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson($url.'/link-crud')->assertOk()->assertJsonPath('data.code', 'LINK-CRUD-CHANGED');
        foreach ([
            [array_diff_key($link, ['coreSegments' => true]), 'SCHEMA'],
            [array_replace($link, ['id' => 'duplicate-link', 'code' => 'LINK-CRUD-CHANGED']), 'DUPLICATE_CODE'],
            [array_replace($link, ['id' => 'wrong-core-link', 'code' => 'WRONG-CORE-LINK', 'coreSegments' => ['missing-core']]), 'REFERENCE'],
        ] as [$payload, $code]) {
            $draft = $this->draft();
            $this->postJson($url, $payload, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertSame($draft, $this->draft());
        }
        try { DB::table('logical_links')->where('map_id', 'test-map')->where('id', 'link-crud')->delete(); self::fail('Raw delete must not orphan allocated core.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame(1451, $error->errorInfo[1]); }
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->getContent();
        $this->deleteJson($url.'/link-crud', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson($url.'/link-crud')->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        self::assertSame(0, DB::table('logical_link_core_segments')->where('map_id', 'test-map')->where('logical_link_id', 'link-crud')->count());
        $this->getJson('/api/v1/admin/fiber-cores/link-core')->assertOk()->assertJsonPath('data.status', 'unallocated');
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        foreach (['post', 'patch', 'delete'] as $method) self::assertSame(1, DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'inventory.'.$method.'.logical-links')->count());
        $this->secondMap();
        $this->postJson($url, array_replace($link, ['id' => 'cross-map-link', 'code' => 'CROSS-MAP-LINK', 'fromPortId' => 'only-b-port']), ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
    }

    public function test_fo_power_corridor_crud_rejections_preserve_draft_and_audit(): void
    {
        $base = $this->draft();
        $audit = DB::table('audit_logs')->where('map_id', 'test-map')->count();
        foreach (['cables' => 'cables', 'fiber-cores' => 'fiberCores', 'fiber-terminations' => 'fiberTerminations', 'fiber-splices' => 'fiberSplices', 'logical-links' => 'logicalLinks', 'power-circuits' => 'powerCircuits', 'route-corridors' => 'routes'] as $resource => $key) {
            $url = '/api/v1/admin/'.$resource;
            $row = $base['content'][$key][0];
            $id = $row['id'];
            $this->postJson($url, array_diff_key($row, ['id' => true]), ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
            $this->postJson($url, array_replace($row, ['id' => 17]), ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
            $this->postJson($url, $row, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'DUPLICATE_ID');
            $this->patchJson($url.'/'.$id, ['unexpectedField' => 'synthetic-secret'], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA')
                ->assertDontSee('synthetic-secret');
            $this->getJson($url.'/missing-'.$resource)->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
            $this->deleteJson($url.'/missing-'.$resource, [], ['If-Match' => $this->etag()])->assertNotFound();
            self::assertSame($base, $this->draft());
        }
        self::assertSame($audit, DB::table('audit_logs')->where('map_id', 'test-map')->count());
        $other = $this->secondMap();
        $editor = User::create(['id' => (string) Str::uuid(), 'email' => 'inventory-editor@example.invalid', 'name' => 'Inventory editor', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        $publisher = User::create(['id' => (string) Str::uuid(), 'email' => 'inventory-publisher@example.invalid', 'name' => 'Inventory publisher', 'password' => 'synthetic-test-password', 'roles' => ['publisher']]);
        DB::table('user_map_roles')->insert([
            ['user_id' => $editor->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $publisher->id, 'map_id' => 'test-map', 'role' => 'publisher'],
        ]);
        foreach (['cables' => 'cables', 'fiber-cores' => 'fiberCores', 'fiber-terminations' => 'fiberTerminations', 'fiber-splices' => 'fiberSplices', 'logical-links' => 'logicalLinks', 'power-circuits' => 'powerCircuits', 'route-corridors' => 'routes'] as $resource => $key) {
            $url = '/api/v1/admin/'.$resource;
            $id = $base['content'][$key][0]['id'];
            $this->withSession(['admin_id' => $editor->id, '_token' => $this->csrf]);
            $this->getJson($url.'?mapId=other-map')->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
            $this->getJson($url.'?mapId=absent-map')->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
            $this->postJson($url.'?mapId=other-map', ['id' => 'denied'], ['If-Match' => '"draft:1"'])->assertForbidden();
            $this->withSession(['admin_id' => $publisher->id, '_token' => $this->csrf]);
            $this->patchJson($url.'/'.$id, ['code' => 'DENIED'], ['If-Match' => '"draft:1"'])->assertForbidden();
            $this->deleteJson($url.'/'.$id, [], ['If-Match' => '"draft:1"'])->assertForbidden();
        }
        self::assertSame($base, $this->workflow->draft($this->workflow->map('test-map')));
        self::assertEquals($other, $this->workflow->store->content($this->workflow->map('other-map')));
        self::assertSame($audit, DB::table('audit_logs')->where('map_id', 'test-map')->count());
    }

    public function test_fo_power_corridor_mutations_are_audited_per_resource(): void
    {
        $version = $this->draft()['version'];
        foreach ([
            ['cables', 'demo-fo-01', ['lengthM' => 101]],
            ['fiber-cores', 'demo-core-01', ['status' => 'faulty']],
            ['fiber-terminations', 'demo-term-01', ['portId' => 'demo-sfp-01']],
            ['fiber-splices', 'demo-splice-02', ['closureDeviceId' => 'demo-closure-02']],
            ['logical-links', 'demo-link-a', ['code' => 'AUDIT-LINK']],
            ['power-circuits', 'demo-circuit-01', ['supplyType' => 'backup']],
            ['route-corridors', 'demo-corridor-01', ['name' => 'Audit route']],
        ] as [$resource, $id, $patch]) {
            $this->patchJson('/api/v1/admin/'.$resource.'/'.$id, $patch, ['If-Match' => '"draft:'.$version.'"'])->assertOk();
            $version++;
            $log = DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'inventory.patch.'.$resource)->first();
            self::assertNotNull($log, $resource);
            self::assertSame($this->admin->id, $log->actor_id);
            self::assertSame($version, json_decode($log->details, true, 64, JSON_THROW_ON_ERROR)['version']);
        }
        self::assertSame($version, $this->draft()['version']);
    }

    public function test_fo_power_corridor_mutation_failure_rolls_back_every_resource(): void
    {
        $revision = $this->publish();
        $viewer = $this->viewerMap()->assertOk()->getContent();
        $before = $this->draft();
        $audit = DB::table('audit_logs')->where('map_id', 'test-map')->count();
        $counts = [];
        foreach (['cables', 'fiber_cable_details', 'power_cable_details', 'fiber_cores', 'fiber_terminations', 'fiber_splices', 'logical_links', 'logical_link_core_segments', 'power_circuits', 'power_circuit_cables', 'route_corridors', 'corridor_cables'] as $table) $counts[$table] = DB::table($table)->where('map_id', 'test-map')->count();
        foreach ([
            ['cables', 'demo-fo-01', ['lengthM' => 101]],
            ['fiber-cores', 'demo-core-01', ['status' => 'faulty']],
            ['fiber-terminations', 'demo-term-01', ['portId' => 'demo-sfp-01']],
            ['fiber-splices', 'demo-splice-02', ['closureDeviceId' => 'demo-closure-02']],
            ['logical-links', 'demo-link-a', ['code' => 'ROLLBACK-LINK']],
            ['power-circuits', 'demo-circuit-01', ['supplyType' => 'backup']],
            ['route-corridors', 'demo-corridor-01', ['name' => 'Rollback Route']],
        ] as [$resource, $id, $patch]) {
            InfrastructureMap::saving(fn () => throw new \RuntimeException('Injected inventory failure'));
            try {
                $this->patchJson('/api/v1/admin/'.$resource.'/'.$id, $patch, ['If-Match' => $this->etag()])
                    ->assertStatus(500)->assertJsonPath('error.code', 'HTTP_500');
            } finally { InfrastructureMap::flushEventListeners(); }
            self::assertSame($before, $this->draft(), $resource);
            self::assertSame($audit, DB::table('audit_logs')->where('map_id', 'test-map')->count(), $resource);
            foreach ($counts as $table => $count) self::assertSame($count, DB::table($table)->where('map_id', 'test-map')->count(), $resource.' '.$table);
            self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
            self::assertSame($viewer, $this->viewerMap()->assertOk()->getContent());
        }
    }

    public function test_camera_mutation_requires_system_admin_without_touching_other_permissions(): void
    {
        $revision = $this->publish();
        $viewer = $this->viewerMap()->assertOk()->getContent();
        $before = $this->draft();
        $audit = DB::table('audit_logs')->where('map_id', 'test-map')->count();
        $cameraCount = DB::table('cameras')->where('map_id', 'test-map')->count();
        $this->secondMap();
        $editor = User::create(['id' => (string) Str::uuid(), 'email' => 'camera-editor@example.invalid', 'name' => 'Camera editor', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        $publisher = User::create(['id' => (string) Str::uuid(), 'email' => 'camera-publisher@example.invalid', 'name' => 'Camera publisher', 'password' => 'synthetic-test-password', 'roles' => ['publisher']]);
        $ungranted = User::create(['id' => (string) Str::uuid(), 'email' => 'camera-ungranted@example.invalid', 'name' => 'Camera ungranted', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        DB::table('user_map_roles')->insert([
            ['user_id' => $editor->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $publisher->id, 'map_id' => 'test-map', 'role' => 'publisher'],
        ]);
        $camera = array_replace($before['content']['cameras'][0], ['id' => 'camera-extra', 'code' => 'CAMERA-EXTRA', 'name' => 'Extra camera']);
        $etag = '"draft:'.$before['version'].'"';
        $url = '/api/v1/admin/cameras';
        $this->withSession(['admin_id' => $editor->id, '_token' => $this->csrf]);
        $this->getJson($url)->assertOk();
        $this->postJson($url, $camera, ['If-Match' => $etag])->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
        $this->patchJson($url.'/demo-camera-01', ['name' => 'Denied'], ['If-Match' => $etag])->assertForbidden();
        $this->deleteJson($url.'/demo-camera-01', [], ['If-Match' => $etag])->assertForbidden();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Editor allowed'], ['If-Match' => $etag])->assertOk();
        $afterEditor = $this->draft();
        $this->withSession(['admin_id' => $publisher->id, '_token' => $this->csrf]);
        $etag = $this->etag();
        $this->getJson($url)->assertOk();
        $this->postJson($url, $camera, ['If-Match' => $etag])->assertForbidden();
        $this->patchJson($url.'/demo-camera-01', ['name' => 'Denied'], ['If-Match' => $etag])->assertForbidden();
        $this->deleteJson($url.'/demo-camera-01', [], ['If-Match' => $etag])->assertForbidden();
        $this->withSession(['admin_id' => $ungranted->id, '_token' => $this->csrf]);
        $this->getJson($url)->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');
        $this->getJson($url.'?mapId=other-map')->assertForbidden();
        $this->getJson($url.'?mapId=missing-map')->assertForbidden();
        $this->postJson($url.'?mapId=other-map', $camera, ['If-Match' => $etag])->assertForbidden();
        self::assertSame($afterEditor, $this->workflow->draft($this->workflow->map('test-map')));
        self::assertSame($cameraCount, DB::table('cameras')->where('map_id', 'test-map')->count());
        self::assertSame($audit + 1, DB::table('audit_logs')->where('map_id', 'test-map')->count());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($viewer, $this->viewerMap()->assertOk()->getContent());
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        $this->postJson($url, $camera, ['If-Match' => $this->etag()])->assertCreated();
        $this->getJson($url.'/camera-extra')->assertOk()->assertJsonPath('data.name', 'Extra camera');
        $this->patchJson($url.'/camera-extra', ['name' => 'Changed camera'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson($url.'/camera-extra')->assertJsonPath('data.name', 'Changed camera');
        $this->postJson($url, array_replace($camera, ['id' => 'camera-duplicate']), ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'DUPLICATE_CODE');
        $this->postJson($url, array_replace($camera, ['id' => 'camera-cross-map', 'code' => 'CAMERA-CROSS-MAP', 'siteId' => 'only-b-site']), ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->deleteJson($url.'/camera-extra', [], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson($url.'/camera-extra')->assertNotFound();
        foreach (['post', 'patch', 'delete'] as $method) self::assertSame(1, DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'inventory.'.$method.'.cameras')->count());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($viewer, $this->viewerMap()->assertOk()->getContent());
    }

    public function test_map_node_and_edge_inventory_crud_integrity_and_map_scope(): void
    {
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->getContent();
        $base = $this->content();
        $node = array_replace($base['layout']['nodes'][0], ['id' => 'crud-layout-node']);
        $edge = array_replace($base['layout']['edges'][0], ['id' => 'crud-layout-edge']);
        foreach ([['map-nodes', $node, 'label'], ['map-edges', $edge, 'label']] as [$resource, $row, $field]) {
            $url = '/api/v1/admin/'.$resource;
            $total = $this->getJson($url.'?perPage=1')->assertOk()->json('meta.total');
            $this->postJson($url, $row, ['If-Match' => $this->etag()])->assertCreated();
            $this->getJson($url.'?page=1&perPage=100')->assertOk()->assertJsonPath('meta.total', $total + 1);
            $this->getJson($url.'/'.$row['id'])->assertOk()->assertJsonPath('data.id', $row['id']);
            $this->patchJson($url.'/'.$row['id'], [$field => 'CRUD layout'], ['If-Match' => $this->etag()])->assertOk();
            $this->getJson($url.'/'.$row['id'])->assertOk()->assertJsonPath('data.'.$field, 'CRUD layout');
            $before = $this->draft();
            $this->postJson($url, array_replace($row, ['id' => 'bad-'.$resource, $resource === 'map-nodes' ? 'entityId' : 'fromNodeId' => 'missing-reference']), ['If-Match' => $this->etag()])
                ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
            $this->postJson($url, $row, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'DUPLICATE_ID');
            $this->patchJson($url.'/'.$row['id'], ['x' => 'wrong-type'], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
            self::assertSame($before, $this->draft());
            $this->getJson($url.'/missing-'.$resource)->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        }
        $this->deleteJson('/api/v1/admin/map-nodes/demo-node-01', [], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        foreach (['map-edges' => 'crud-layout-edge', 'map-nodes' => 'crud-layout-node'] as $resource => $id) {
            $url = '/api/v1/admin/'.$resource.'/'.$id;
            $this->deleteJson($url, [], ['If-Match' => $this->etag()])->assertOk();
            $this->getJson($url)->assertNotFound();
            foreach (['post', 'patch', 'delete'] as $method) self::assertSame(1, DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'inventory.'.$method.'.'.$resource)->count());
        }
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        $this->secondMap();
        $this->getJson('/api/v1/admin/map-nodes/crud-layout-node?mapId=other-map')->assertNotFound();
        $this->postJson('/api/v1/admin/map-nodes', array_replace($node, ['id' => 'cross-map-node', 'entityId' => 'only-b-site']), ['If-Match' => $this->etag()])
            ->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
    }

    public function test_cable_patch_partial_subtypes_and_rejected_mix(): void
    {
        $this->patchJson('/api/v1/admin/cables/demo-fo-01', ['lengthM' => 75], ['If-Match' => $this->etag()])->assertOk();
        $this->patchJson('/api/v1/admin/cables/demo-fo-01', ['fiberType' => 'multi_mode'], ['If-Match' => $this->etag()])->assertOk();
        $this->patchJson('/api/v1/admin/cables/demo-power-01', ['voltageV' => 48], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/cables/demo-fo-01')->assertJsonPath('data.lengthM', 75.0)->assertJsonPath('data.fiberType', 'multi_mode');
        $this->getJson('/api/v1/admin/cables/demo-power-01')->assertJsonPath('data.voltageV', 48.0);
        $before = $this->draft();
        foreach ([
            ['demo-fo-01', ['conductorCount' => 3]],
            ['demo-power-01', ['totalCores' => 24]],
            ['demo-fo-01', ['kind' => 'power', 'conductorCount' => 3]],
            ['demo-power-01', ['kind' => 'fiber', 'totalCores' => 24]],
            ['demo-fo-01', ['lengthM' => -1]],
            ['demo-fo-01', ['password' => 'synthetic-secret']],
        ] as [$id, $patch]) {
            $response = $this->patchJson('/api/v1/admin/cables/'.$id, $patch, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
            self::assertStringNotContainsString('synthetic-secret', $response->getContent());
        }
        self::assertSame($before, $this->draft());
    }

    public function test_inventory_list_and_error_envelopes_across_resources(): void
    {
        foreach (array_keys(InventoryStore::RESOURCES) as $resource) {
            $first = $this->getJson('/api/v1/admin/'.$resource.'?page=1&perPage=1')->assertOk()
                ->assertJsonPath('meta.page', 1)->assertJsonPath('meta.perPage', 1);
            $total = $first->json('meta.total');
            self::assertIsInt($total);
            self::assertCount(min(1, $total), $first->json('data'));
            $second = $this->getJson('/api/v1/admin/'.$resource.'?page=2&perPage=1')->assertOk()
                ->assertJsonPath('meta.total', $total);
            self::assertCount(min(1, max(0, $total - 1)), $second->json('data'));
            $this->getJson('/api/v1/admin/'.$resource.'?perPage=101')->assertStatus(422)->assertJsonPath('error.code', 'INPUT');
            $this->getJson('/api/v1/admin/'.$resource.'/definitely-missing-resource')->assertNotFound()->assertJsonPath('error.code', 'HTTP_404');
        }
    }

    public function test_edit_conflict_never_overwrites_and_requires_if_match(): void
    {
        $etag = $this->etag();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'First'], ['If-Match' => $etag])->assertOk();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Lost'], ['If-Match' => $etag])->assertStatus(409)->assertJsonPath('error.code', 'DRAFT_CONFLICT');
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Lost'])->assertStatus(428);
        $this->getJson('/api/v1/admin/sites/demo-site-01')->assertJsonPath('data.name', 'First');
    }

    public function test_draft_validate_publish_history_etag_and_authorized_rollback(): void
    {
        $this->viewerMap()->assertNotFound();
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertStatus(409);
        $first = $this->publish();
        $v2 = $this->viewerMap()->assertOk()->assertJsonPath('data.revision', $first);
        self::assertSame(hash('sha256', $v2->getContent()), $v2->headers->get('X-Content-SHA256'));
        $this->viewerMap('2', ['If-None-Match' => $v2->headers->get('ETag')])->assertStatus(304)->assertContent('');
        $this->viewerMap('1')->assertOk()->assertJsonPath('data.schemaVersion', 1);
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'New name'], ['If-Match' => $this->etag()])->assertOk();
        $this->viewerMap()->assertJsonPath('data.sites.0.name', 'DEMO Site 01');
        $second = $this->publish();
        self::assertNotSame($first, $second);
        $this->viewerMap()->assertJsonPath('data.sites.0.name', 'New name');
        $this->getJson('/api/v1/admin/map-revisions')->assertOk()->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/map-revisions/'.$first)->assertOk()->assertJsonPath('data.sites.0.name', 'DEMO Site 01');
        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => $first], ['If-Match' => $this->etag()])->assertOk();
        $this->viewerMap()->assertJsonPath('data.revision', $first);
        self::assertSame(1, DB::table('audit_logs')->where('action', 'map.rollback')->where('map_id', 'test-map')->count());
    }

    public function test_viewer_etag_and_checksum_follow_exact_response_bytes(): void
    {
        $firstRevision = $this->publish();
        $responses = [];
        foreach (['/api/v1/viewer/map?schemaVersion=1', '/api/v1/viewer/map?schemaVersion=2', '/api/v1/viewer/cameras?schemaVersion=2', '/api/v1/viewer/sites/demo-site-01?schemaVersion=2'] as $path) {
            $headers = ['Authorization' => 'Bearer '.$this->viewer];
            $response = $this->getJson($path, $headers)->assertOk();
            $body = $response->getContent();
            $checksum = hash('sha256', $body);
            $etag = '"sha256:'.$checksum.'"';
            self::assertSame($checksum, $response->headers->get('X-Content-SHA256'));
            self::assertSame($etag, $response->headers->get('ETag'));
            self::assertSame('application/json', $response->headers->get('Content-Type'));
            $unchanged = $this->getJson($path, $headers + ['If-None-Match' => $etag])->assertStatus(304)->assertContent('');
            self::assertSame($etag, $unchanged->headers->get('ETag'));
            self::assertSame($checksum, $unchanged->headers->get('X-Content-SHA256'));
            $responses[$path] = [$body, $etag];
        }
        self::assertNotSame($responses['/api/v1/viewer/map?schemaVersion=1'][1], $responses['/api/v1/viewer/map?schemaVersion=2'][1]);

        $path = '/api/v1/viewer/map?schemaVersion=2';
        [$oldBody, $oldEtag] = $responses[$path];
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Unpublished change'], ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($oldBody, $this->getJson($path, ['Authorization' => 'Bearer '.$this->viewer])->assertOk()->getContent());
        $this->getJson($path, ['Authorization' => 'Bearer '.$this->viewer, 'If-None-Match' => $oldEtag])->assertStatus(304)->assertContent('');

        $secondRevision = $this->publish();
        self::assertNotSame($firstRevision, $secondRevision);
        $changed = $this->getJson($path, ['Authorization' => 'Bearer '.$this->viewer, 'If-None-Match' => $oldEtag])->assertOk();
        self::assertNotSame($oldBody, $changed->getContent());
        self::assertSame(hash('sha256', $changed->getContent()), $changed->headers->get('X-Content-SHA256'));
        self::assertNotSame($oldEtag, $changed->headers->get('ETag'));

        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => $firstRevision], ['If-Match' => $this->etag()])->assertOk();
        $restored = $this->getJson($path, ['Authorization' => 'Bearer '.$this->viewer])->assertOk();
        self::assertSame($oldBody, $restored->getContent());
        self::assertSame($oldEtag, $restored->headers->get('ETag'));
    }

    public function test_revision_history_pagination_detail_immutability_and_map_scope(): void
    {
        $this->secondMap();
        $this->getJson('/api/v1/admin/map-revisions')->assertOk()->assertJsonPath('meta.total', 0)->assertJsonPath('data', []);
        $first = $this->publish();
        $firstSnapshot = MapRevision::findOrFail($first)->snapshot;
        $firstDetail = $this->getJson('/api/v1/admin/map-revisions/'.$first)->assertOk()->getContent();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Later revision'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/map-revisions')->assertOk()->assertJsonPath('meta.total', 1);
        self::assertSame($firstDetail, $this->getJson('/api/v1/admin/map-revisions/'.$first)->assertOk()->getContent());
        $second = $this->publish();
        $this->workflow->validate('other-map', '"draft:1"', $this->admin);
        $other = $this->workflow->publish('other-map', '"draft:1"', $this->admin)->id;
        $page1 = $this->getJson('/api/v1/admin/map-revisions?perPage=1&page=1')->assertOk()->assertJsonPath('meta.total', 2)->assertJsonPath('meta.perPage', 1)->json('data');
        $page2 = $this->getJson('/api/v1/admin/map-revisions?perPage=1&page=2')->assertOk()->assertJsonPath('meta.total', 2)->json('data');
        self::assertCount(1, $page1);
        self::assertCount(1, $page2);
        self::assertEqualsCanonicalizing([$first, $second], [$page1[0]['revisionId'], $page2[0]['revisionId']]);
        self::assertArrayNotHasKey('snapshot', $page1[0]);
        $this->getJson('/api/v1/admin/map-revisions?perPage=1&page=3')->assertOk()->assertJsonPath('data', [])->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/map-revisions?perPage=0')->assertStatus(422);
        $this->getJson('/api/v1/admin/map-revisions?mapId=other-map')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.revisionId', $other);
        $this->getJson('/api/v1/admin/map-revisions/'.$other)->assertNotFound();
        $this->getJson('/api/v1/admin/map-revisions/'.$first.'?mapId=other-map')->assertNotFound();
        self::assertSame($firstDetail, $this->getJson('/api/v1/admin/map-revisions/'.$first)->assertOk()->getContent());
        self::assertSame($firstSnapshot, MapRevision::findOrFail($first)->snapshot);

        $reader = User::create(['id' => (string) Str::uuid(), 'email' => 'history-reader@example.invalid', 'name' => 'History reader', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        DB::table('user_map_roles')->insert(['user_id' => $reader->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor']);
        $auditCount = DB::table('audit_logs')->count();
        $pointer = $this->workflow->map('test-map')->active_revision_id;
        $viewer = $this->viewerMap()->assertOk()->getContent();
        $this->withSession(['admin_id' => $reader->id, '_token' => $this->csrf]);
        $this->getJson('/api/v1/admin/map-revisions')->assertOk()->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/map-revisions/'.$first)->assertOk();
        $denied = $this->getJson('/api/v1/admin/map-revisions?mapId=other-map')->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN')->json('error');
        $this->getJson('/api/v1/admin/map-revisions/'.$other.'?mapId=other-map')->assertForbidden()->assertJsonPath('error', $denied);
        $this->getJson('/api/v1/admin/map-revisions?mapId=missing-map')->assertForbidden()->assertJsonPath('error', $denied);
        $this->getJson('/api/v1/admin/map-revisions/'.$other)->assertNotFound();
        $this->getJson('/api/v1/admin/map-revisions', ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        self::assertSame($auditCount, DB::table('audit_logs')->count());
        self::assertSame($pointer, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($viewer, $this->viewerMap()->assertOk()->getContent());
        self::assertSame(3, MapRevision::count());
    }

    public function test_authorized_rollback_is_atomic_and_preserves_revision_and_audit_history(): void
    {
        $this->secondMap();
        $first = $this->publish();
        $firstViewer = $this->viewerMap()->assertOk()->getContent();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Second published'], ['If-Match' => $this->etag()])->assertOk();
        $second = $this->publish();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Unpublished draft'], ['If-Match' => $this->etag()])->assertOk();
        $before = $this->draft();
        $etag = $this->etag();
        $secondViewer = $this->viewerMap()->assertOk()->assertJsonPath('data.revision', $second)->getContent();
        $revisions = MapRevision::orderBy('id')->get(['id', 'snapshot', 'checksum'])->toJson();
        $audits = DB::table('audit_logs')->orderBy('id')->get()->toJson();

        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => $first])->assertStatus(428)->assertJsonPath('error.code', 'PRECONDITION_REQUIRED');
        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => $first], ['If-Match' => '"draft:1"'])->assertStatus(409)->assertJsonPath('error.code', 'DRAFT_CONFLICT');
        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => (string) Str::uuid()], ['If-Match' => $etag])->assertNotFound();
        $this->postJson('/api/v1/admin/map/rollback?mapId=other-map', ['revisionId' => $first], ['If-Match' => '"draft:1"'])->assertNotFound();
        $editor = User::create(['id' => (string) Str::uuid(), 'email' => 'rollback-editor@example.invalid', 'name' => 'Rollback editor', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        DB::table('user_map_roles')->insert(['user_id' => $editor->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor']);
        $this->withSession(['admin_id' => $editor->id, '_token' => $this->csrf]);
        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => $first], ['If-Match' => $etag])->assertForbidden();
        $this->postJson('/api/v1/admin/map/rollback?mapId=other-map', ['revisionId' => $first], ['If-Match' => '"draft:1"'])->assertForbidden();
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        self::assertSame($before, $this->draft());
        self::assertSame($secondViewer, $this->viewerMap()->assertOk()->getContent());
        self::assertSame($revisions, MapRevision::orderBy('id')->get(['id', 'snapshot', 'checksum'])->toJson());
        self::assertSame($audits, DB::table('audit_logs')->orderBy('id')->get()->toJson());

        $failAt = null;
        InfrastructureMap::saved(function () use (&$failAt) {
            if ($failAt === 'pointer') throw new \RuntimeException('Injected rollback pointer failure');
        });
        DB::listen(function ($query) use (&$failAt) {
            if ($failAt === 'audit' && str_contains(strtolower($query->sql), 'audit_logs')) throw new \RuntimeException('Injected rollback audit failure');
        });
        try {
            foreach (['pointer', 'audit'] as $stage) {
                $failAt = $stage;
                try {
                    $this->workflow->rollback('test-map', $etag, $this->admin, $first);
                    self::fail('Expected rollback '.$stage.' failure');
                } catch (\RuntimeException $error) {
                    self::assertSame('Injected rollback '.$stage.' failure', $error->getMessage());
                } finally {
                    $failAt = null;
                }
                self::assertSame($before, $this->draft());
                self::assertSame($revisions, MapRevision::orderBy('id')->get(['id', 'snapshot', 'checksum'])->toJson());
                self::assertSame($audits, DB::table('audit_logs')->orderBy('id')->get()->toJson());
                self::assertSame($secondViewer, $this->viewerMap()->assertOk()->getContent());
            }
        } finally {
            $failAt = null;
            InfrastructureMap::flushEventListeners();
        }

        $this->postJson('/api/v1/admin/map/rollback', ['revisionId' => $first], ['If-Match' => $etag])->assertOk()
            ->assertJsonPath('data.activeRevisionId', $first)
            ->assertJsonPath('data.version', $before['version'] + 1)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.content.sites.0.name', 'Unpublished draft');
        self::assertSame($firstViewer, $this->viewerMap()->assertOk()->getContent());
        self::assertSame($revisions, MapRevision::orderBy('id')->get(['id', 'snapshot', 'checksum'])->toJson());
        $afterAudits = DB::table('audit_logs')->orderBy('id')->get();
        self::assertCount(count(json_decode($audits)) + 1, $afterAudits);
        $rollback = $afterAudits->last();
        self::assertSame('map.rollback', $rollback->action);
        self::assertSame($this->admin->id, $rollback->actor_id);
        self::assertEquals(['revision' => $first, 'previousRevision' => $second, 'version' => $before['version'] + 1], json_decode($rollback->details, true));
    }

    public function test_viewer_has_no_admin_or_write_access(): void
    {
        foreach (['post', 'put', 'patch', 'delete'] as $method) {
            $path = $method === 'post' ? '/api/v1/admin/sites' : '/api/v1/admin/sites/demo-site-01';
            $this->{$method.'Json'}($path, [], ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
            $this->{$method.'Json'}('/api/v1/viewer/map', [], ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        }
        foreach (['/api/v1/admin/map/draft', '/api/v1/admin/map-revisions'] as $path) $this->getJson($path, ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        $this->getJson('/api/v1/viewer/map')->assertUnauthorized();
    }

    public function test_viewer_published_map_hides_draft_secrets_and_other_maps(): void
    {
        $this->viewerMap()->assertNotFound();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['metadata' => ['notes' => 'PUBLIC-NOTE']], ['If-Match' => $this->etag()])->assertOk();
        $this->admin->name = 'PRIVATE-ACTOR-CANARY';
        $this->admin->save();
        $this->workflow->audit($this->admin, 'test-map', 'synthetic.private', ['secret' => 'PRIVATE-AUDIT-CANARY']);
        $revision = $this->publish();
        $published = $this->viewerMap()->assertOk()->assertJsonPath('data.revision', $revision)
            ->assertJsonPath('data.sites.0.metadata.notes', 'PUBLIC-NOTE')->getContent();
        foreach (['PRIVATE-ACTOR-CANARY', 'PRIVATE-AUDIT-CANARY', $this->viewer, 'synthetic-test-password', 'publishedBy', 'tokenHash'] as $secret) {
            self::assertStringNotContainsString($secret, $published);
        }

        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'UNPUBLISHED-DRAFT-CANARY'], ['If-Match' => $this->etag()])->assertOk();
        $this->getJson('/api/v1/admin/map/draft')->assertOk()->assertJsonPath('data.content.sites.0.name', 'UNPUBLISHED-DRAFT-CANARY');
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        $this->secondMap();
        $otherToken = bin2hex(random_bytes(32));
        DB::table('viewer_tokens')->insert(['id' => (string) Str::uuid(), 'name' => 'Other map viewer', 'map_id' => 'other-map', 'token_hash' => hash('sha256', $otherToken), 'expires_at' => now()->addHour(), 'created_at' => now(), 'updated_at' => now()]);
        $this->getJson('/api/v1/viewer/map?schemaVersion=2&mapId=other-map', ['Authorization' => 'Bearer '.$this->viewer])->assertOk()->assertJsonPath('data.mapId', 'test-map');
        $this->getJson('/api/v1/viewer/map?schemaVersion=2&mapId=test-map', ['Authorization' => 'Bearer '.$otherToken])->assertNotFound();

        $before = [InfrastructureMap::whereKey('test-map')->firstOrFail()->active_revision_id, MapRevision::count(), DB::table('audit_logs')->count()];
        $this->getJson('/api/v1/admin/map/draft', ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        $this->postJson('/api/v1/viewer/map', [], ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        $this->postJson('/api/v1/admin/map/publish', [], ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
        self::assertSame($before, [InfrastructureMap::whereKey('test-map')->firstOrFail()->active_revision_id, MapRevision::count(), DB::table('audit_logs')->count()]);
        self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
    }

    public function test_roles_csrf_login_logout_and_session_rotation(): void
    {
        DB::table('user_map_roles')->insert([
            ['user_id' => $this->admin->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $this->admin->id, 'map_id' => 'test-map', 'role' => 'publisher'],
        ]);
        $this->admin->roles = ['infrastructure_editor'];
        $this->admin->save();
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $this->etag()])->assertForbidden();
        $this->admin->roles = ['publisher'];
        $this->admin->save();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'No'], ['If-Match' => $this->etag()])->assertForbidden();
        $this->admin->roles = ['system_admin'];
        $this->admin->save();
        $this->withHeader('X-CSRF-TOKEN', 'wrong');
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'No'])->assertStatus(419);
        $this->withHeader('X-CSRF-TOKEN', $this->csrf);
        $this->postJson('/api/v1/auth/logout')->assertOk()->assertJsonPath('data.user', null);
        $this->getJson('/api/v1/admin/map/draft')->assertUnauthorized();
        $token = $this->getJson('/api/v1/auth/session')->assertOk()->json('data.csrfToken');
        $this->withHeader('X-CSRF-TOKEN', $token);
        $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'synthetic-test-password'])->assertOk()->assertJsonPath('data.user.id', $this->admin->id);
        $this->getJson('/api/v1/admin/map/draft')->assertOk();
        self::assertTrue(Hash::check('synthetic-test-password', $this->admin->password));
        self::assertStringNotContainsString('synthetic-test-password', json_encode(DB::table('audit_logs')->get()));
    }

    public function test_map_roles_enforce_read_write_validate_and_publish_scope(): void
    {
        $other = $this->secondMap();
        $publishedA = $this->publish();
        $viewerA = $this->viewerMap()->assertOk()->getContent();
        $users = [];
        foreach (['editor' => ['infrastructure_editor'], 'publisher' => ['publisher'], 'multi' => ['infrastructure_editor', 'publisher']] as $name => $roles) {
            $users[$name] = User::create(['id' => (string) Str::uuid(), 'email' => $name.'@example.invalid', 'name' => $name, 'password' => 'synthetic-test-password', 'roles' => $roles]);
        }
        DB::table('user_map_roles')->insert([
            ['user_id' => $users['editor']->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $users['publisher']->id, 'map_id' => 'other-map', 'role' => 'publisher'],
            ['user_id' => $users['multi']->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $users['multi']->id, 'map_id' => 'other-map', 'role' => 'publisher'],
        ]);
        foreach ([
            ['user_id' => $users['editor']->id, 'map_id' => 'test-map', 'role' => 'infrastructure_editor'],
            ['user_id' => $users['editor']->id, 'map_id' => 'missing-map', 'role' => 'infrastructure_editor'],
            ['user_id' => (string) Str::uuid(), 'map_id' => 'test-map', 'role' => 'publisher'],
        ] as $invalid) {
            try { DB::table('user_map_roles')->insert($invalid); self::fail('Membership duplicate/FK must reject.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        }
        $beforeB = $this->workflow->map('other-map')->draft_version;
        $this->withSession(['admin_id' => $users['editor']->id, '_token' => $this->csrf]);
        $this->getJson('/api/v1/admin/sites')->assertOk();
        $this->getJson('/api/v1/admin/audit-logs')->assertForbidden();
        $this->getJson('/api/v1/admin/sites/only-b-site')->assertNotFound();
        $this->postJson('/api/v1/admin/devices', $other['devices'][1], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $denied = $this->getJson('/api/v1/admin/map/draft?mapId=other-map')->assertStatus(403)->assertJsonPath('error.code', 'FORBIDDEN')->json('error');
        $this->getJson('/api/v1/admin/map/draft?mapId=unknown-map')->assertStatus(403)->assertJsonPath('error', $denied);
        foreach (['sites', 'sites/demo-site-01', 'map-layouts', 'map-revisions', 'audit-logs'] as $path) {
            $this->getJson('/api/v1/admin/'.$path.'?mapId=other-map')->assertStatus(403)->assertJsonPath('error', $denied);
        }
        foreach (['post' => '/map/validate', 'put' => '/map/draft', 'patch' => '/sites/demo-site-01', 'delete' => '/sites/demo-site-01'] as $method => $path) {
            $this->{$method.'Json'}('/api/v1/admin'.$path.'?mapId=other-map', [], ['If-Match' => '"draft:'.$beforeB.'"'])->assertStatus(403)->assertJsonPath('error', $denied);
        }
        $this->postJson('/api/v1/admin/sites?mapId=other-map', [], ['If-Match' => '"draft:'.$beforeB.'"'])->assertStatus(403)->assertJsonPath('error', $denied);
        $this->putJson('/api/v1/admin/map-layouts?mapId=other-map', $other['layout'], ['If-Match' => '"draft:'.$beforeB.'"'])->assertStatus(403)->assertJsonPath('error', $denied);
        $this->postJson('/api/v1/admin/map/publish?mapId=other-map', [], ['If-Match' => '"draft:'.$beforeB.'"'])->assertStatus(403)->assertJsonPath('error', $denied);
        $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $this->etag()])->assertStatus(403);
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Editor change'], ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($beforeB, $this->workflow->map('other-map')->draft_version);
        self::assertSame($publishedA, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($viewerA, $this->viewerMap()->assertOk()->getContent());

        $this->withSession(['admin_id' => $users['publisher']->id, '_token' => $this->csrf]);
        $this->getJson('/api/v1/admin/map/draft?mapId=other-map')->assertOk();
        $this->getJson('/api/v1/admin/audit-logs?mapId=other-map')->assertOk();
        $this->getJson('/api/v1/admin/map/draft')->assertStatus(403);
        $this->putJson('/api/v1/admin/map-layouts?mapId=other-map', $other['layout'], ['If-Match' => '"draft:'.$beforeB.'"'])->assertStatus(403)->assertJsonPath('error.code', 'FORBIDDEN');
        $this->patchJson('/api/v1/admin/sites/demo-site-01?mapId=other-map', ['name' => 'Denied'], ['If-Match' => '"draft:'.$beforeB.'"'])->assertStatus(403);
        $this->postJson('/api/v1/admin/map/validate?mapId=other-map', [], ['If-Match' => '"draft:'.$beforeB.'"'])->assertOk()->assertJsonPath('data.valid', true);
        $publishedB = $this->postJson('/api/v1/admin/map/publish?mapId=other-map', [], ['If-Match' => '"draft:'.$beforeB.'"'])->assertCreated()->json('data.revisionId');
        $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => '"draft:2"'])->assertStatus(403);

        $this->withSession(['admin_id' => $users['editor']->id, '_token' => $this->csrf]);
        $this->getJson('/api/v1/admin/map-revisions/'.$publishedB.'?mapId=other-map')->assertStatus(403)->assertJsonPath('error', $denied);
        $this->getJson('/api/v1/admin/map-revisions/'.$publishedB)->assertNotFound();

        $this->withSession(['admin_id' => $users['multi']->id, '_token' => $this->csrf]);
        $this->getJson('/api/v1/admin/map/draft')->assertOk();
        $this->getJson('/api/v1/admin/map/draft?mapId=other-map')->assertOk();
        $this->postJson('/api/v1/admin/map/validate')->assertStatus(403);
        $this->patchJson('/api/v1/admin/sites/demo-site-01?mapId=other-map', ['name' => 'Denied'])->assertStatus(403);
        $this->withSession(['admin_id' => $this->admin->id, '_token' => $this->csrf]);
        $this->getJson('/api/v1/admin/map/draft?mapId=other-map')->assertOk();
        $this->getJson('/api/v1/admin/map/draft?mapId=unknown-map')->assertStatus(403)->assertJsonPath('error', $denied);
    }

    public function test_map_role_cli_grant_revoke_and_scoped_login(): void
    {
        $user = User::create(['id' => (string) Str::uuid(), 'email' => 'scoped@example.invalid', 'name' => 'Scoped editor', 'password' => 'synthetic-test-password', 'roles' => ['infrastructure_editor']]);
        $this->withSession(['admin_id' => null, '_token' => $this->csrf]);
        $credentials = ['email' => $user->email, 'password' => 'synthetic-test-password'];
        $this->postJson('/api/v1/auth/login', $credentials)->assertStatus(401)->assertJsonPath('error.code', 'INVALID_LOGIN');
        self::assertSame(1, \Illuminate\Support\Facades\Artisan::call('senkom:map-role', ['email' => $user->email, 'map' => 'test-map', 'role' => 'publisher']));
        self::assertSame(0, \Illuminate\Support\Facades\Artisan::call('senkom:map-role', ['email' => $user->email, 'map' => 'test-map', 'role' => 'infrastructure_editor']));
        $this->postJson('/api/v1/auth/login', $credentials)->assertOk()->assertJsonPath('data.user.id', $user->id);
        $this->getJson('/api/v1/admin/map/draft')->assertOk();
        self::assertSame(0, \Illuminate\Support\Facades\Artisan::call('senkom:map-role', ['email' => $user->email, 'map' => 'test-map', 'role' => 'infrastructure_editor', '--revoke' => true]));
        $this->getJson('/api/v1/admin/map/draft')->assertStatus(403)->assertJsonPath('error.code', 'FORBIDDEN');
        $csrf = $this->getJson('/api/v1/auth/session')->assertOk()->json('data.csrfToken');
        $this->postJson('/api/v1/auth/logout', [], ['X-CSRF-TOKEN' => $csrf])->assertOk();
    }

    public function test_expired_and_revoked_viewer_tokens_are_rejected(): void
    {
        DB::table('viewer_tokens')->where('token_hash', hash('sha256', $this->viewer))->update(['expires_at' => now()->subSecond()]);
        $this->viewerMap()->assertUnauthorized();
        DB::table('viewer_tokens')->where('token_hash', hash('sha256', $this->viewer))->update(['expires_at' => now()->addHour(), 'revoked_at' => now()]);
        $this->viewerMap()->assertUnauthorized();
    }

    public function test_viewer_cli_token_lifecycle_scope_and_secret_free_audit(): void
    {
        $this->publish();
        $publishedA = $this->viewerMap()->assertOk()->getContent();
        $this->secondMap();
        $this->workflow->validate('other-map', '"draft:1"', $this->admin);
        $publishedB = $this->workflow->publish('other-map', '"draft:1"', $this->admin)->id;
        $path = sys_get_temp_dir().DIRECTORY_SEPARATOR.'senkom-viewer-'.bin2hex(random_bytes(8)).'.token';
        try {
            $command = ['name' => 'Synthetic viewer B', '--map' => 'other-map', '--hours' => '1', '--output' => $path];
            self::assertSame(1, \Illuminate\Support\Facades\Artisan::call('senkom:viewer-token', array_replace($command, ['--hours' => '25'])));
            self::assertFileDoesNotExist($path);
            self::assertSame(0, \Illuminate\Support\Facades\Artisan::call('senkom:viewer-token', $command));
            $token = file_get_contents($path);
            self::assertMatchesRegularExpression('/\A[a-f0-9]{64}\z/', $token);
            self::assertStringNotContainsString($token, \Illuminate\Support\Facades\Artisan::output());
            $record = DB::table('viewer_tokens')->where('token_hash', hash('sha256', $token))->first();
            self::assertNotNull($record);
            self::assertSame('other-map', $record->map_id);
            self::assertGreaterThan(now()->addMinutes(59)->timestamp, strtotime($record->expires_at));
            self::assertLessThan(now()->addMinutes(61)->timestamp, strtotime($record->expires_at));
            self::assertStringNotContainsString($token, json_encode(DB::table('viewer_tokens')->get()));
            self::assertSame(1, \Illuminate\Support\Facades\Artisan::call('senkom:viewer-token', $command));
            self::assertSame($token, file_get_contents($path));
            $headers = ['Authorization' => 'Bearer '.$token];
            $this->getJson('/api/v1/viewer/map?schemaVersion=2&mapId=test-map', $headers)->assertOk()->assertJsonPath('data.mapId', 'other-map')->assertJsonPath('data.revision', $publishedB);
            $invalid = $this->getJson('/api/v1/viewer/map', ['Authorization' => 'Bearer '.str_repeat('f', 64)])->assertUnauthorized();
            self::assertStringNotContainsString($token, $invalid->getContent());
            $this->getJson('/api/v1/admin/map/draft', $headers)->assertForbidden()->assertJsonPath('error.code', 'VIEWER_READ_ONLY');
            $this->postJson('/api/v1/admin/map/publish', [], $headers)->assertForbidden();
            $this->postJson('/api/v1/viewer/map', [], $headers)->assertForbidden();
            $created = DB::table('audit_logs')->where('action', 'auth.viewer_token_created_cli')->where('map_id', 'other-map')->first();
            self::assertNotNull($created);
            self::assertNull($created->actor_id);
            self::assertNotNull($created->created_at);
            self::assertSame(['hours' => 1], json_decode($created->details, true));
            self::assertSame(0, \Illuminate\Support\Facades\Artisan::call('senkom:revoke-viewer', ['id' => $record->id]));
            self::assertNotNull(DB::table('viewer_tokens')->where('id', $record->id)->value('revoked_at'));
            $this->getJson('/api/v1/viewer/map', $headers)->assertUnauthorized();
            self::assertSame(1, DB::table('audit_logs')->where('action', 'auth.viewer_token_revoked_cli')->where('map_id', 'other-map')->count());
            self::assertStringNotContainsString($token, json_encode(DB::table('audit_logs')->get()));
            self::assertSame($publishedA, $this->viewerMap()->assertOk()->getContent());
            self::assertSame($publishedB, $this->workflow->map('other-map')->active_revision_id);
        } finally {
            @unlink($path);
        }
    }

    public function test_auth_audit_records_outcome_without_credentials(): void
    {
        $this->postJson('/api/v1/auth/logout')->assertOk();
        $csrf = $this->getJson('/api/v1/auth/session')->assertOk()->json('data.csrfToken');
        $this->withHeader('X-CSRF-TOKEN', $csrf);
        $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'incorrect-password'])->assertUnauthorized()->assertJsonPath('error.code', 'INVALID_LOGIN');
        $login = $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'synthetic-test-password'])->assertOk();
        $this->postJson('/api/v1/auth/logout', [], ['X-CSRF-TOKEN' => $login->json('data.csrfToken')])->assertOk();
        $events = DB::table('audit_logs')->whereIn('action', ['auth.login_denied', 'auth.login', 'auth.logout'])->orderBy('id')->get();
        self::assertSame(['auth.logout', 'auth.login_denied', 'auth.login', 'auth.logout'], $events->pluck('action')->all());
        self::assertSame([$this->admin->id, null, $this->admin->id, $this->admin->id], $events->pluck('actor_id')->all());
        foreach ($events as $event) {
            self::assertNull($event->map_id);
            self::assertNotNull($event->created_at);
            self::assertSame([], json_decode($event->details, true));
        }
        $json = json_encode($events);
        foreach (['incorrect-password', 'synthetic-test-password', $this->viewer, $csrf, $login->json('data.csrfToken')] as $secret) self::assertStringNotContainsString($secret, $json);
        $this->getJson('/api/v1/admin/audit-logs', ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
    }

    public function test_all_resource_routes_and_metadata_schema_negotiation(): void
    {
        foreach (InventoryStore::RESOURCES as $resource => [$key]) {
            $row = $this->getJson('/api/v1/admin/'.$resource.'?perPage=1')->assertOk()->json('data.0');
            $this->putJson('/api/v1/admin/'.$resource.'/'.$row['id'], $row, ['If-Match' => $this->etag()])->assertOk();
            $this->getJson('/api/v1/admin/'.$resource.'/'.$row['id'])->assertOk()->assertJsonPath('data.id', $row['id']);
        }
        $content = $this->content();
        $content['layout']['nodes'][0]['label'] = 'Public label';
        $content['layout']['nodes'][0]['symbol'] = 'site';
        $content['layout']['nodes'][0]['zIndex'] = 4;
        $content['sites'][0]['geography'] = ['latitude' => -6.0, 'longitude' => 106.0];
        $content['sites'][0]['metadata'] = [];
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
        $this->publish();
        $this->viewerMap()->assertOk()->assertJsonPath('data.layout.nodes.0.label', 'Public label');
        $v1 = $this->viewerMap('1')->assertOk()->json('data');
        self::assertArrayNotHasKey('label', $v1['layout']['nodes'][0]);
        self::assertTrue((new MapRules())->schemaValid($v1, 'published-map.v1.json'));
        $device = ['id' => 'new-pdu', 'code' => 'DEMO-PDU', 'siteId' => 'demo-site-01', 'type' => 'pdu', 'status' => ['state' => 'unknown', 'source' => 'inventory']];
        $this->postJson('/api/v1/admin/devices', $device, ['If-Match' => $this->etag()])->assertCreated();
        $this->publish();
        $this->viewerMap('1')->assertStatus(406);
        $this->viewerMap('2')->assertOk();
        $this->viewerMap('3')->assertStatus(406);
    }

    public function test_viewer_schema_negotiation_preserves_compatible_cache(): void
    {
        $first = $this->publish();
        $v1 = $this->getJson('/api/v1/viewer/map', ['Authorization' => 'Bearer '.$this->viewer])->assertOk();
        self::assertSame(1, $v1->json('data.schemaVersion'));
        self::assertSame(1, $v1->json('meta.schemaVersion'));
        self::assertTrue($this->workflow->rules->schemaValid($v1->json('data'), 'published-map.v1.json'));
        $v2 = $this->viewerMap('2')->assertOk()->assertJsonPath('data.revision', $first)->assertJsonPath('data.mapId', 'test-map');
        self::assertTrue($this->workflow->rules->schemaValid($v2->json('data'), 'published-map.v2.json'));
        $oldEtag = $v1->headers->get('ETag');
        foreach (['0', '3', '2.0'] as $version) $this->viewerMap($version)->assertStatus(406)->assertJsonPath('error.code', 'SCHEMA_UNSUPPORTED');

        $device = ['id' => 'new-pdu', 'code' => 'DEMO-PDU', 'siteId' => 'demo-site-01', 'type' => 'pdu', 'status' => ['state' => 'unknown', 'source' => 'inventory']];
        $this->postJson('/api/v1/admin/devices', $device, ['If-Match' => $this->etag()])->assertCreated();
        $second = $this->publish();
        $incompatible = $this->viewerMap('1', ['If-None-Match' => $oldEtag])->assertStatus(406)->assertJsonPath('error.code', 'SCHEMA_UNSUPPORTED');
        self::assertNull($incompatible->headers->get('ETag'));
        self::assertStringNotContainsString('new-pdu', $incompatible->getContent());
        $current = $this->viewerMap('2')->assertOk()->assertJsonPath('data.revision', $second);
        self::assertContains('new-pdu', array_column($current->json('data.devices'), 'id'));
    }

    public function test_viewer_corrupt_snapshot_fails_without_publishing_bad_bytes(): void
    {
        $revision = $this->publish();
        $good = $this->viewerMap('2')->assertOk()->getContent();
        $before = [InfrastructureMap::whereKey('test-map')->firstOrFail()->active_revision_id, MapRevision::count(), DB::table('audit_logs')->count()];
        $corruption = null;
        MapRevision::retrieved(function (MapRevision $row) use (&$corruption, $revision): void {
            if ($row->id !== $revision || $corruption === null) return;
            $row->snapshot = match ($corruption) {
                'checksum' => $row->snapshot.' ',
                'json' => '{broken',
                'schema' => '[]',
            };
            if ($corruption !== 'checksum') $row->checksum = hash('sha256', $row->snapshot);
        });
        try {
            foreach (['checksum', 'json', 'schema'] as $kind) {
                $corruption = $kind;
                foreach (['/api/v1/viewer/map?schemaVersion=1', '/api/v1/viewer/map?schemaVersion=2', '/api/v1/viewer/cameras?schemaVersion=2', '/api/v1/viewer/sites/demo-site-01?schemaVersion=2'] as $path) {
                    $failed = $this->getJson($path, ['Authorization' => 'Bearer '.$this->viewer])->assertStatus(503)->assertJsonPath('error.code', 'SNAPSHOT_UNAVAILABLE');
                    self::assertNull($failed->headers->get('ETag'));
                    self::assertNull($failed->headers->get('X-Content-SHA256'));
                    self::assertStringNotContainsString($this->viewer, $failed->getContent());
                }
            }
        } finally {
            $corruption = null;
        }
        self::assertSame($before, [InfrastructureMap::whereKey('test-map')->firstOrFail()->active_revision_id, MapRevision::count(), DB::table('audit_logs')->count()]);
        self::assertSame($good, $this->viewerMap('2')->assertOk()->getContent());
    }

    public function test_demo_origin_is_immutable_and_input_boundary_is_closed(): void
    {
        $content = $this->content();
        $content['dataOrigin'] = 'production';
        $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'IMMUTABLE_ORIGIN');
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['password' => 'synthetic-secret'], ['If-Match' => $this->etag()])->assertStatus(422);
        $this->getJson('/api/v1/admin/sites?perPage=101')->assertStatus(422);
        $this->withHeader('X-CSRF-TOKEN', 'invalid');
        $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'synthetic-test-password'])->assertStatus(419);
        $this->withHeader('X-CSRF-TOKEN', $this->csrf);
        for ($i = 0; $i < 5; $i++) $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'incorrect-password'])->assertUnauthorized();
        $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'synthetic-test-password'])->assertStatus(429);
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.5']);
        $this->postJson('https://localhost/api/v1/auth/login', ['email' => 'admin@example.invalid', 'password' => 'synthetic-test-password'])->assertOk();
    }

    public function test_database_restricts_cross_map_references_and_immutable_history(): void
    {
        $id = $this->publish();
        foreach ([
            fn () => DB::table('devices')->where('map_id', 'test-map')->update(['site_id' => 'missing']),
            fn () => DB::table('map_revisions')->where('id', $id)->update(['checksum' => str_repeat('0', 64)]),
            fn () => DB::table('map_revisions')->where('id', $id)->delete(),
            fn () => DB::table('audit_logs')->where('map_id', 'test-map')->delete(),
            fn () => DB::table('logical_link_core_segments')->insert(['map_id' => 'test-map', 'logical_link_id' => 'demo-link-a', 'fiber_core_id' => 'demo-core-01', 'sequence' => 99]),
        ] as $operation) {
            try { $operation(); self::fail('Database must reject invariant violation.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertContains((string) $error->getCode(), ['23000', '45000']); }
        }
        $this->viewerMap()->assertJsonPath('data.revision', $id);
    }

    public function test_transaction_failure_rolls_back_draft_and_publish_pointer(): void
    {
        $first = $this->publish();
        $before = $this->content();
        $map = $this->workflow->map('test-map');
        try {
            DB::transaction(function () use ($map, $before) {
                $changed = $before;
                $changed['sites'][0]['name'] = 'Must rollback';
                app(InventoryStore::class)->replace($map, $changed);
                throw new \RuntimeException('Injected write failure');
            });
        } catch (\RuntimeException) {}
        self::assertSame($before, $this->content());
        MapRevision::created(fn () => throw new \RuntimeException('Injected publication failure'));
        try {
            $etag = $this->etag();
            $this->workflow->validate('test-map', $etag, $this->admin);
            $this->workflow->publish('test-map', $etag, $this->admin);
            self::fail('Expected failure');
        } catch (\RuntimeException $error) { self::assertSame('Injected publication failure', $error->getMessage()); }
        finally { MapRevision::flushEventListeners(); }
        self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
        $this->viewerMap()->assertJsonPath('data.revision', $first);
    }

    public function test_publish_late_failure_and_audit_failure_leave_previous_revision_intact(): void
    {
        $first = $this->publish();
        $oldSnapshot = MapRevision::findOrFail($first)->snapshot;
        $oldViewer = $this->viewerMap()->assertOk()->getContent();
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['name' => 'Next revision'], ['If-Match' => $this->etag()])->assertOk();
        $etag = $this->etag();
        $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $etag])->assertOk()->assertJsonPath('data.valid', true);
        $before = $this->draft();
        $auditCount = DB::table('audit_logs')->where('action', 'map.publish')->count();
        $failAt = null;
        InfrastructureMap::saved(function () use (&$failAt) {
            if ($failAt === 'pointer') throw new \RuntimeException('Injected pointer failure');
        });
        DB::listen(function ($query) use (&$failAt) {
            if ($failAt === 'audit' && str_contains(strtolower($query->sql), 'audit_logs')) throw new \RuntimeException('Injected audit failure');
        });

        try {
            foreach (['pointer', 'audit'] as $stage) {
                $failAt = $stage;
                try {
                    $this->workflow->publish('test-map', $etag, $this->admin);
                    self::fail('Expected '.$stage.' failure');
                } catch (\RuntimeException $error) {
                    self::assertSame('Injected '.$stage.' failure', $error->getMessage());
                } finally {
                    $failAt = null;
                }
                self::assertSame($before, $this->draft());
                self::assertSame($first, $this->workflow->map('test-map')->active_revision_id);
                self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
                self::assertSame($auditCount, DB::table('audit_logs')->where('action', 'map.publish')->count());
                self::assertSame($oldSnapshot, MapRevision::findOrFail($first)->snapshot);
                self::assertSame($oldViewer, $this->viewerMap()->assertOk()->getContent());
            }
        } finally {
            $failAt = null;
            InfrastructureMap::flushEventListeners();
        }

        $second = $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $etag])->assertCreated()->json('data.revisionId');
        self::assertNotSame($first, $second);
        self::assertSame($oldSnapshot, MapRevision::findOrFail($first)->snapshot);
        $this->viewerMap()->assertOk()->assertJsonPath('data.revision', $second)->assertJsonPath('data.sites.0.name', 'Next revision');
        self::assertSame($auditCount + 1, DB::table('audit_logs')->where('action', 'map.publish')->count());
    }

    private function secondMap(): array
    {
        $base = $this->content();
        $other = $base;
        foreach (MapRules::COLLECTIONS as $key) $other[$key] = [];
        $other['layout']['nodes'] = $other['layout']['edges'] = [];
        $site = $base['sites'][0];
        $site['name'] = 'OTHER-MAP-MARKER';
        $site['metadata'] = ['notes' => 'OTHER-MAP-MARKER'];
        $site['geography'] = ['latitude' => 40, 'longitude' => -70];
        $device = $base['devices'][0];
        $device['siteId'] = $site['id'];
        $device['model'] = 'OTHER-MAP-MARKER';
        $port = $base['ports'][0];
        $port['deviceId'] = $device['id'];
        $port['name'] = 'OTHER-MAP-MARKER';
        $other['sites'] = [$site, array_replace($site, ['id' => 'only-b-site', 'code' => 'ONLY-B-SITE'])];
        $other['devices'] = [$device, array_replace($device, ['id' => 'only-b-device', 'code' => 'ONLY-B-DEVICE', 'siteId' => 'only-b-site'])];
        $other['ports'] = [$port, array_replace($port, ['id' => 'only-b-port', 'deviceId' => 'only-b-device'])];
        self::assertSame([], $this->workflow->rules->inspect($other, true));
        $map = InfrastructureMap::create(['id' => 'other-map', 'name' => 'Synthetic other map', 'data_origin' => 'demo', 'demo_label' => $other['demoLabel'], 'width' => $other['layout']['width'], 'height' => $other['layout']['height'], 'layers' => $other['layers']]);
        $this->workflow->store->replace($map, $other);
        return $other;
    }

    public function test_domain_demo_contract_and_no_orphan_references(): void
    {
        $content = $this->content();
        self::assertSame('demo', $content['dataOrigin']);
        self::assertStringContainsString('DEMO', $content['demoLabel']);
        self::assertSame([], $this->workflow->rules->inspect($content, true));
        foreach (['sites' => 8, 'devices' => 6, 'ports' => 4] as $key => $count) {
            self::assertCount($count, $content[$key]);
            self::assertCount($count, array_unique(array_column($content[$key], 'id')));
        }
        foreach ($content['sites'] as $site) {
            self::assertArrayNotHasKey('geography', $site);
            self::assertArrayNotHasKey('metadata', $site);
        }
        $this->secondMap();
        foreach (['devices' => ['sites', 'site_id'], 'device_ports' => ['devices', 'device_id']] as $table => [$parent, $key]) {
            self::assertSame(0, DB::table($table.' as child')->leftJoin($parent.' as parent', fn ($join) => $join->on('child.map_id', '=', 'parent.map_id')->on('child.'.$key, '=', 'parent.id'))->whereNull('parent.id')->count());
        }
        foreach (['sites', 'devices', 'device_ports'] as $table) {
            self::assertSame(0, DB::table($table)->whereNotIn('map_id', ['test-map', 'other-map'])->count());
        }
        $fixture = file_get_contents(base_path('../../tests/fixtures/demo-map.v1.json'));
        self::assertDoesNotMatchRegularExpression('/"(?:password|secret|token|token_hash|rtspUrl)"\s*:/i', $fixture);
        self::assertSame(1, DB::table('audit_logs')->where('action', 'map.seed_demo')->where('map_id', 'test-map')->count());
    }

    public function test_domain_geography_boundaries_and_public_metadata_round_trip(): void
    {
        $before = $this->content();
        foreach ([[-90, -180], [90, 180], [0, 0], [-6.2, 106.8]] as [$latitude, $longitude]) {
            $geography = compact('latitude', 'longitude');
            $metadata = ['notes' => str_repeat('n', 2000), 'assetTag' => str_repeat('a', 100)];
            $this->patchJson('/api/v1/admin/sites/'.$before['sites'][0]['id'], compact('geography', 'metadata'), ['If-Match' => $this->etag()])->assertOk();
            $actual = $this->content();
            self::assertEquals($geography, $actual['sites'][0]['geography']);
            self::assertSame($metadata, $actual['sites'][0]['metadata']);
            self::assertSame($before['devices'], $actual['devices']);
            self::assertSame($before['ports'], $actual['ports']);
            self::assertSame($before['layout'], $actual['layout']);
        }
        $this->publish();
        $this->viewerMap()->assertOk()->assertJsonPath('data.sites.0.metadata', $metadata);
        $legacy = $this->viewerMap('1')->assertOk()->json('data.sites.0');
        self::assertArrayNotHasKey('geography', $legacy);
        self::assertArrayNotHasKey('metadata', $legacy);
    }

    public static function invalidDomainFields(): array
    {
        return [
            'latitude above maximum' => ['sites', ['geography' => ['latitude' => 90.01, 'longitude' => 0]]],
            'latitude below minimum' => ['sites', ['geography' => ['latitude' => -90.01, 'longitude' => 0]]],
            'longitude above maximum' => ['sites', ['geography' => ['latitude' => 0, 'longitude' => 180.01]]],
            'longitude below minimum' => ['sites', ['geography' => ['latitude' => 0, 'longitude' => -180.01]]],
            'coordinate string' => ['sites', ['geography' => ['latitude' => '-6', 'longitude' => 106]]],
            'missing coordinate' => ['sites', ['geography' => ['latitude' => 0]]],
            'unknown coordinate' => ['sites', ['geography' => ['latitude' => 0, 'longitude' => 0, 'altitude' => 1]]],
            'null geography' => ['sites', ['geography' => null]],
            'secret metadata' => ['sites', ['metadata' => ['password' => 'PRIVATE-CANARY']]],
            'admin-only field unsupported' => ['sites', ['metadata' => ['adminNotes' => 'PRIVATE-CANARY']]],
            'notes too long' => ['sites', ['metadata' => ['notes' => str_repeat('n', 2001)]]],
            'asset tag too long' => ['sites', ['metadata' => ['assetTag' => str_repeat('a', 101)]]],
            'notes wrong type' => ['sites', ['metadata' => ['notes' => 7]]],
            'metadata list' => ['sites', ['metadata' => ['PRIVATE-CANARY']]],
            'null metadata' => ['sites', ['metadata' => null]],
            'canvas coordinate on site' => ['sites', ['x' => 10]],
            'viewport on site' => ['sites', ['zoom' => 2]],
            'geography on device unsupported' => ['devices', ['geography' => ['latitude' => 0, 'longitude' => 0]]],
            'metadata on device unsupported' => ['devices', ['metadata' => ['notes' => 'PRIVATE-CANARY']]],
            'metadata on port unsupported' => ['ports', ['metadata' => ['notes' => 'PRIVATE-CANARY']]],
            'physical geography on node' => ['nodes', ['geography' => ['latitude' => 0, 'longitude' => 0]]],
            'private node metadata' => ['nodes', ['metadata' => ['password' => 'PRIVATE-CANARY']]],
            'private edge metadata' => ['edges', ['metadata' => ['password' => 'PRIVATE-CANARY']]],
        ];
    }

    #[DataProvider('invalidDomainFields')]
    public function test_domain_invalid_fields_rejected_without_mutation(string $collection, array $fields): void
    {
        $before = $this->draft();
        $content = $before['content'];
        if (in_array($collection, ['nodes', 'edges'], true)) $content['layout'][$collection][0] = array_replace($content['layout'][$collection][0], $fields);
        else $content[$collection][0] = array_replace($content[$collection][0], $fields);
        $response = $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => '"draft:'.$before['version'].'"'])->assertStatus(422)->assertJsonPath('error.code', 'SCHEMA');
        self::assertStringNotContainsString('PRIVATE-CANARY', $response->getContent());
        self::assertSame($before, $this->draft());
    }

    public function test_domain_layout_changes_preserve_physical_data_and_geography(): void
    {
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['geography' => ['latitude' => -6, 'longitude' => 106], 'metadata' => ['notes' => 'Public site note']], ['If-Match' => $this->etag()])->assertOk();
        $before = $this->content();
        $layout = $before['layout'];
        $layout['width'] += 100;
        $layout['height'] += 100;
        foreach ($layout['nodes'] as &$node) { $node['x'] += 10; $node['y'] += 10; }
        unset($node);
        foreach ($layout['edges'] as &$edge) {
            foreach ($edge['points'] as &$point) { $point['x'] += 10; $point['y'] += 10; }
            unset($point);
        }
        unset($edge);
        $layout['nodes'][0] += ['label' => 'Visual label', 'symbol' => 'site', 'zIndex' => 3, 'metadata' => ['notes' => 'Public visual note']];
        $this->putJson('/api/v1/admin/map-layouts', $layout, ['If-Match' => $this->etag()])->assertOk();
        $after = $this->content();
        foreach (MapRules::COLLECTIONS as $key) self::assertSame($before[$key], $after[$key]);
        self::assertEquals($layout, $after['layout']);
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['geography' => ['latitude' => 1, 'longitude' => 2]], ['If-Match' => $this->etag()])->assertOk();
        self::assertSame($after['layout'], $this->content()['layout']);
        $this->publish();
        $this->viewerMap()->assertOk()->assertJsonPath('data.sites.0.geography.latitude', 1)->assertJsonPath('data.layout.nodes.0.label', 'Visual label');
    }

    public function test_layout_node_edge_waypoint_round_trip_and_invalid_ids(): void
    {
        $revision = $this->publish();
        $viewer = $this->viewerMap()->assertOk()->getContent();
        $before = $this->content();
        $layout = $this->getJson('/api/v1/admin/map-layouts')->assertOk()->assertHeader('ETag', $this->etag())->json('data');
        self::assertEquals($before['layout'], $layout);
        $layout['nodes'][] = ['id' => 'zz-layout-node', 'entityType' => 'site', 'entityId' => 'demo-site-01', 'x' => 321.25, 'y' => 415.5, 'label' => 'Layout node', 'symbol' => 'site', 'zIndex' => 7, 'metadata' => ['notes' => 'Visual only']];
        $layout['edges'][0]['points'] = [['x' => 200, 'y' => 250], ['x' => 200, 'y' => 300], ['x' => 600, 'y' => 300], ['x' => 600, 'y' => 250]];
        $layout['edges'][0]['label'] = 'Routed edge';
        $layout['edges'][0]['zIndex'] = 4;
        $layout['edges'][0]['metadata'] = ['notes' => 'Manual route'];
        $staleEtag = $this->etag();
        $this->putJson('/api/v1/admin/map-layouts', $layout, ['If-Match' => $staleEtag])->assertOk();
        self::assertEquals($layout, $this->getJson('/api/v1/admin/map-layouts')->assertOk()->json('data'));
        self::assertEquals($layout, $this->draft()['content']['layout']);
        foreach (MapRules::COLLECTIONS as $key) self::assertSame($before[$key], $this->content()[$key]);
        self::assertSame(1, DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'map.save_layout')->count());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($viewer, $this->viewerMap()->assertOk()->getContent());
        $this->putJson('/api/v1/admin/map-layouts', $layout, ['If-Match' => $staleEtag])->assertStatus(409)->assertJsonPath('error.code', 'DRAFT_CONFLICT');
        $this->putJson('/api/v1/admin/map-layouts', $layout)->assertStatus(428)->assertJsonPath('error.code', 'PRECONDITION_REQUIRED');

        $invalid = $layout;
        $invalid['nodes'][count($invalid['nodes']) - 1]['id'] = 'invalid id';
        $cases = [[$invalid, 'SCHEMA']];
        $invalid = $layout;
        $invalid['nodes'][count($invalid['nodes']) - 1]['id'] = 'demo-node-01';
        $cases[] = [$invalid, 'DUPLICATE_ID'];
        $invalid = $layout;
        $invalid['edges'][0]['fromNodeId'] = 'missing-node';
        $cases[] = [$invalid, 'REFERENCE'];
        $invalid = $layout;
        $invalid['nodes'][count($invalid['nodes']) - 1]['entityId'] = 'missing-site';
        $cases[] = [$invalid, 'REFERENCE'];
        $invalid = $layout;
        $invalid['edges'][0]['id'] = 'invalid id';
        $cases[] = [$invalid, 'SCHEMA'];
        $invalid = $layout;
        $invalid['edges'][] = $invalid['edges'][0];
        $cases[] = [$invalid, 'DUPLICATE_ID'];
        $invalid = $layout;
        $invalid['edges'][0]['connectionId'] = 'missing-connection';
        $cases[] = [$invalid, 'REFERENCE'];
        $invalid = $layout;
        $invalid['edges'][0]['points'][1]['x'] = -1;
        $cases[] = [$invalid, 'SCHEMA'];
        $invalid = $layout;
        $invalid['edges'][0]['points'][1]['x'] = 'wrong-type';
        $cases[] = [$invalid, 'SCHEMA'];
        $invalid = $layout;
        $invalid['edges'][0]['points'][1]['x'] = $layout['width'] + 1;
        $cases[] = [$invalid, 'BOUNDS'];
        $invalid = $layout;
        $invalid['edges'][0]['points'][1]['secret'] = 'synthetic-secret';
        $cases[] = [$invalid, 'SCHEMA'];
        $invalid = $layout;
        unset($invalid['edges']);
        $cases[] = [$invalid, 'SCHEMA'];
        $this->secondMap();
        $invalid = $layout;
        $invalid['nodes'][count($invalid['nodes']) - 1]['entityId'] = 'only-b-site';
        $cases[] = [$invalid, 'REFERENCE'];
        $saved = $this->draft();
        foreach ($cases as [$payload, $code]) {
            $response = $this->putJson('/api/v1/admin/map-layouts', $payload, ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', $code);
            self::assertStringNotContainsString('synthetic-secret', $response->getContent());
            self::assertSame($saved, $this->draft());
        }
        self::assertSame(1, DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'map.save_layout')->count());
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame($viewer, $this->viewerMap()->assertOk()->getContent());
        $this->publish();
        $this->viewerMap()->assertOk()->assertJsonPath('data.layout.nodes.'.(count($layout['nodes']) - 1).'.id', 'zz-layout-node')
            ->assertJsonPath('data.layout.edges.0.points.1.y', 300);
    }

    public function test_domain_cross_map_fk_and_api_scope(): void
    {
        $before = $this->content();
        $other = $this->secondMap();
        foreach ([
            fn () => DB::table('devices')->where('map_id', 'test-map')->where('id', $before['devices'][0]['id'])->update(['site_id' => 'only-b-site']),
            fn () => DB::table('device_ports')->where('map_id', 'test-map')->where('id', $before['ports'][0]['id'])->update(['device_id' => 'only-b-device']),
        ] as $operation) {
            try { $operation(); self::fail('Cross-map FK must reject the write.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame(1452, $error->errorInfo[1]); }
        }
        foreach (['sites' => 'sites', 'devices' => 'devices', 'ports' => 'ports'] as $resource => $key) {
            $a = $this->getJson('/api/v1/admin/'.$resource.'?mapId=test-map')->assertOk();
            self::assertSame($before[$key], $a->json('data'));
            self::assertStringNotContainsString('OTHER-MAP-MARKER', $a->getContent());
            $b = $this->getJson('/api/v1/admin/'.$resource.'?mapId=other-map')->assertOk();
            self::assertCount(count($other[$key]), $b->json('data'));
        }
        $this->getJson('/api/v1/admin/sites/only-b-site?mapId=test-map')->assertNotFound();
        $this->patchJson('/api/v1/admin/devices/'.$before['devices'][0]['id'], ['siteId' => 'only-b-site'], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->patchJson('/api/v1/admin/ports/'.$before['ports'][0]['id'], ['deviceId' => 'only-b-device'], ['If-Match' => $this->etag()])->assertStatus(422)->assertJsonPath('error.code', 'REFERENCE');
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['metadata' => ['notes' => 'MAP-A-PUBLIC']], ['If-Match' => $this->etag()])->assertOk();
        self::assertEquals($other, $this->workflow->store->content($this->workflow->map('other-map')));
        $this->publish();
        $etag = $this->workflow->etag($this->workflow->map('other-map'));
        $this->workflow->validate('other-map', $etag, $this->admin);
        $this->workflow->publish('other-map', $etag, $this->admin);
        $response = $this->getJson('/api/v1/viewer/map?schemaVersion=2&mapId=other-map', ['Authorization' => 'Bearer '.$this->viewer])->assertOk()->assertJsonPath('data.mapId', 'test-map');
        self::assertStringNotContainsString('OTHER-MAP-MARKER', $response->getContent());
        $this->getJson('/api/v1/viewer/sites/only-b-site?schemaVersion=2', ['Authorization' => 'Bearer '.$this->viewer])->assertNotFound();
    }

    public function test_domain_public_metadata_excludes_administrative_state(): void
    {
        $this->patchJson('/api/v1/admin/sites/demo-site-01', ['metadata' => ['notes' => 'PUBLIC-NOTE', 'assetTag' => 'PUBLIC-ASSET']], ['If-Match' => $this->etag()])->assertOk();
        $this->admin->name = 'PRIVATE-CANARY';
        $this->admin->save();
        $this->workflow->audit($this->admin, 'test-map', 'synthetic.private', ['internal' => 'PRIVATE-CANARY']);
        $this->publish();
        $public = $this->viewerMap()->assertOk()->assertJsonPath('data.sites.0.metadata.notes', 'PUBLIC-NOTE');
        self::assertTrue($this->workflow->rules->schemaValid($public->json('data'), 'published-map.v2.json'));
        foreach (['PRIVATE-CANARY', $this->viewer, $this->admin->password, 'synthetic-test-password', 'publishedBy', 'actorId', 'tokenHash'] as $private) self::assertStringNotContainsString($private, $public->getContent());
        $this->getJson('/api/v1/viewer/sites/demo-site-01?schemaVersion=2', ['Authorization' => 'Bearer '.$this->viewer])->assertOk()->assertJsonPath('data.metadata.assetTag', 'PUBLIC-ASSET');
        $this->getJson('/api/v1/admin/audit-logs', ['Authorization' => 'Bearer '.$this->viewer])->assertForbidden();
    }

    public function test_domain_empty_metadata_remains_json_object_on_all_read_paths(): void
    {
        $content = $this->content();
        $content['sites'][0]['metadata'] = (object) [];
        $content['layout']['nodes'][0]['metadata'] = (object) [];
        $content['layout']['edges'][0]['metadata'] = (object) [];
        $saved = $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
        $wire = json_decode($saved->getContent());
        self::assertInstanceOf(\stdClass::class, $wire->data->content->sites[0]->metadata);
        self::assertInstanceOf(\stdClass::class, $wire->data->content->layout->nodes[0]->metadata);
        self::assertInstanceOf(\stdClass::class, $wire->data->content->layout->edges[0]->metadata);
        $site = $this->getJson('/api/v1/admin/sites/demo-site-01')->assertOk();
        self::assertInstanceOf(\stdClass::class, json_decode($site->getContent())->data->metadata);
        $revision = $this->publish();
        foreach ([$this->viewerMap()->assertOk(), $this->getJson('/api/v1/admin/map-revisions/'.$revision)->assertOk()] as $response) {
            self::assertInstanceOf(\stdClass::class, json_decode($response->getContent())->data->sites[0]->metadata);
        }
    }

    public function test_domain_private_metadata_in_database_cannot_be_published(): void
    {
        $revision = $this->publish();
        $before = $this->viewerMap()->assertOk()->getContent();
        $etag = $this->etag();
        $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $etag])->assertOk()->assertJsonPath('data.valid', true);
        DB::table('sites')->where('map_id', 'test-map')->where('id', 'demo-site-01')->update(['metadata' => '{"password":"PRIVATE-CANARY"}']);
        $response = $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $etag])->assertStatus(422)->assertJsonPath('error.code', 'INVALID_DRAFT');
        self::assertStringNotContainsString('PRIVATE-CANARY', $response->getContent());
        $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $etag])
            ->assertOk()->assertJsonPath('data.valid', false)->assertJsonPath('data.issues.0.code', 'SCHEMA');
        self::assertStringNotContainsString('PRIVATE-CANARY', $validation->getContent());
        self::assertStringNotContainsString('PRIVATE-CANARY', DB::table('audit_logs')->where('map_id', 'test-map')->where('action', 'map.validate')->latest('id')->value('details'));
        self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
        self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
        self::assertSame($before, $this->viewerMap()->assertOk()->getContent());
    }

    public static function invalidDrafts(): array
    {
        return [
            'missing site' => ['site', false, 'REFERENCE'],
            'duplicate identity' => ['duplicate', false, 'DUPLICATE_ID'],
            'core collision' => ['allocation', false, 'CORE_CONFLICT'],
            'wrong termination' => ['termination', false, 'WRONG_END'],
            'splice conflict' => ['splice', false, 'END_CONFLICT'],
            'schema metadata' => ['secret', false, 'SCHEMA'],
            'bad coordinate' => ['coordinate', false, 'BOUNDS'],
            'missing node' => ['node', false, 'REFERENCE'],
            'broken optical path' => ['path', true, 'PATH_GAP'],
            'wrong power source' => ['power', true, 'POWER_SOURCE'],
            'diagonal edge' => ['diagonal', true, 'ORTHOGONAL'],
        ];
    }

    #[DataProvider('invalidDrafts')]
    public function test_publication_validation(string $case, bool $publication, string $code): void
    {
        $content = $this->content();
        switch ($case) {
            case 'site': $content['devices'][0]['siteId'] = 'missing'; break;
            case 'duplicate': $content['sites'][] = $content['sites'][0]; break;
            case 'allocation': $link = $content['logicalLinks'][0]; $link['id'] = 'second'; $link['code'] = 'SECOND'; $content['logicalLinks'][] = $link; break;
            case 'termination': $content['fiberTerminations'][0]['endSide'] = 'b'; break;
            case 'splice': $splice = $content['fiberSplices'][0]; $splice['id'] = 'second'; $content['fiberSplices'][] = $splice; break;
            case 'secret': $content['sites'][0]['metadata'] = ['password' => 'synthetic-secret']; break;
            case 'coordinate': $content['layout']['nodes'][0]['x'] = 2000000; break;
            case 'node': $content['layout']['edges'][0]['toNodeId'] = 'missing'; break;
            case 'path': $content['fiberSplices'] = []; break;
            case 'power': foreach ($content['devices'] as &$device) if ($device['id'] === 'demo-source-01') $device['type'] = 'switch'; unset($device); break;
            case 'diagonal': $content['layout']['edges'][0]['points'][0]['y'] += 10; break;
        }
        $issues = $this->workflow->rules->inspect($content, $publication);
        self::assertContains($code, array_column($issues, 'code'));
        self::assertStringNotContainsString('synthetic-secret', json_encode($issues));
        if (!$publication) {
            $before = $this->content();
            $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertStatus(422);
            self::assertSame($before, $this->content());
        } else {
            $revision = $this->publish();
            $published = $this->viewerMap()->assertOk()->getContent();
            $this->putJson('/api/v1/admin/map/draft', $content, ['If-Match' => $this->etag()])->assertOk();
            $etag = $this->etag();
            $validation = $this->postJson('/api/v1/admin/map/validate', [], ['If-Match' => $etag])->assertOk()
                ->assertJsonPath('data.valid', false)->assertJsonPath('data.version', $this->draft()['version']);
            self::assertContains($code, array_column($validation->json('data.issues'), 'code'));
            self::assertStringNotContainsString('synthetic-secret', $validation->getContent());
            $this->postJson('/api/v1/admin/map/publish', [], ['If-Match' => $etag])
                ->assertStatus(409)->assertJsonPath('error.code', 'VALIDATION_REQUIRED');
            self::assertSame('draft', $this->draft()['status']);
            self::assertSame($revision, $this->workflow->map('test-map')->active_revision_id);
            self::assertSame(1, MapRevision::where('map_id', 'test-map')->count());
            self::assertSame($published, $this->viewerMap()->assertOk()->getContent());
        }
    }
}
