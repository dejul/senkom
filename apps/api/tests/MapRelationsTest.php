<?php

declare(strict_types=1);

namespace Tests;

use App\Models\{Cable, Device, FiberCore, FiberSplice, FiberTermination, LogicalLink, Port, PowerCircuit, RouteCorridor, Site};
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;

final class MapRelationsTest extends TestCase
{
    private array $maps = [];

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->afterBootstrapping(LoadConfiguration::class, function ($app) {
            $app['config']->set([
                'database.default' => 'mysql',
                'database.connections.mysql.url' => null,
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => getenv('SENKOM_TEST_DB_PORT') ?: '0',
                'database.connections.mysql.database' => getenv('SENKOM_TEST_DB_DATABASE') ?: 'senkom_test',
                'database.connections.mysql.username' => getenv('SENKOM_TEST_DB_USERNAME') ?: 'root',
                'database.connections.mysql.password' => getenv('SENKOM_TEST_DB_PASSWORD') ?: '',
                'database.connections.mysql.unix_socket' => '',
            ]);
        });
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();
        if (!getenv('SENKOM_TEST_DB_PORT')) $this->markTestSkipped('Verify isolated MySQL, then set SENKOM_TEST_DB_PORT.');
        $identity = DB::selectOne('SELECT DATABASE() AS name, @@port AS port, @@datadir AS datadir');
        self::assertSame(getenv('SENKOM_TEST_DB_DATABASE') ?: 'senkom_test', $identity->name);
        self::assertStringEndsWith('_test', $identity->name);
        self::assertSame((int) getenv('SENKOM_TEST_DB_PORT'), (int) $identity->port);
        $artifactRoot = str_replace('\\', '/', realpath(__DIR__.'/../../../.artifacts')).'/';
        self::assertStringStartsWith(strtolower($artifactRoot), strtolower(str_replace('\\', '/', $identity->datadir)));
        DB::beginTransaction();
        $prefix = 'relation-'.bin2hex(random_bytes(8));
        $this->maps = ['a' => $prefix.'-a', 'b' => $prefix.'-b'];
        foreach ($this->maps as $key => $map) {
            DB::table('maps')->insert(['id' => $map, 'name' => $map, 'data_origin' => 'demo', 'width' => 100, 'height' => 100, 'layers' => '[]']);
            foreach (['s1', 's2', 'empty', 'foreign-only'] as $id) {
                if ($id === 'foreign-only' && $key === 'a') continue;
                DB::table('sites')->insert(['map_id' => $map, 'id' => $id, 'code' => $id, 'name' => $map.'/'.$id, 'type' => 'field_site', 'status' => '{}']);
            }
            foreach (['d1' => 's1', 'd2' => $key === 'a' ? 's1' : 's2', 'empty' => 's2', 'foreign-only' => 'foreign-only'] as $id => $site) {
                if ($id === 'foreign-only' && $key === 'a') continue;
                DB::table('devices')->insert(['map_id' => $map, 'id' => $id, 'code' => $id, 'site_id' => $site, 'type' => 'switch', 'status' => '{}']);
            }
            foreach (['p1' => $key === 'a' ? 'd1' : 'd2', 'p2' => 'd1', 'p3' => $key === 'a' ? 'd2' : 'empty', 'foreign-only' => 'foreign-only'] as $id => $device) {
                if ($id === 'foreign-only' && $key === 'a') continue;
                DB::table('device_ports')->insert(['map_id' => $map, 'id' => $id, 'device_id' => $device, 'name' => $id, 'type' => 'ethernet', 'status' => '{}']);
            }
        }
    }

    protected function tearDown(): void
    {
        if ($this->app) {
            DB::disableQueryLog();
            if (DB::transactionLevel() > 0) DB::rollBack();
        }
        parent::tearDown();
    }

    public static function relations(): array
    {
        return [
            'Site.devices' => [Site::class, 'devices', ['s1', 's2', 'empty']],
            'Device.site' => [Device::class, 'site', ['d1', 'd2', 'empty']],
            'Device.ports' => [Device::class, 'ports', ['d1', 'd2', 'empty']],
            'Port.device' => [Port::class, 'device', ['p1', 'p2', 'p3']],
        ];
    }

    public static function loadingModes(): array
    {
        $cases = [];
        foreach (self::relations() as $name => $args) {
            foreach (['with', 'load', 'loadMissing'] as $mode) $cases[$name.' '.$mode] = [...$args, $mode];
        }
        return $cases;
    }

    private function expected(string $relation, string $map, string $id): array
    {
        $expected = [
            'devices' => ['a' => ['s1' => ['d1', 'd2'], 's2' => ['empty'], 'empty' => []], 'b' => ['s1' => ['d1'], 's2' => ['d2', 'empty'], 'empty' => []]],
            'site' => ['a' => ['d1' => ['s1'], 'd2' => ['s1'], 'empty' => ['s2']], 'b' => ['d1' => ['s1'], 'd2' => ['s2'], 'empty' => ['s2']]],
            'ports' => ['a' => ['d1' => ['p1', 'p2'], 'd2' => ['p3'], 'empty' => []], 'b' => ['d1' => ['p2'], 'd2' => ['p1'], 'empty' => ['p3']]],
            'device' => ['a' => ['p1' => ['d1'], 'p2' => ['d1'], 'p3' => ['d2']], 'b' => ['p1' => ['d2'], 'p2' => ['d1'], 'p3' => ['empty']]],
        ];
        return array_map(fn ($related) => $this->maps[$map].'/'.$related, $expected[$relation][$map][$id]);
    }

    private function identities($related): array
    {
        $rows = $related instanceof \Illuminate\Database\Eloquent\Collection ? $related->all() : ($related ? [$related] : []);
        $keys = array_map(fn ($row) => $row->map_id.'/'.$row->id, $rows);
        sort($keys);
        return $keys;
    }

    private function logQueries(): void
    {
        DB::flushQueryLog();
        DB::enableQueryLog();
    }

    private function assertQueries(int $count): void
    {
        $queries = DB::getQueryLog();
        self::assertCount($count, $queries);
        foreach ($queries as $query) self::assertDoesNotMatchRegularExpression('/`map_id`\s+is\s+null/i', $query['query']);
    }

    #[DataProvider('relations')]
    public function test_lazy_and_single_parent_eager_agree(string $class, string $relation, array $ids): void
    {
        $parent = $class::where('map_id', $this->maps['a'])->whereKey($ids[0])->firstOrFail();
        $this->logQueries();
        $expected = $this->expected($relation, 'a', $ids[0]);
        self::assertSame($expected, $this->identities($parent->$relation));
        $this->assertQueries(1);
        $this->logQueries();
        $eager = $class::with($relation)->where('map_id', $this->maps['a'])->whereKey($ids[0])->firstOrFail();
        self::assertSame($expected, $this->identities($eager->$relation));
        $this->assertQueries(2);
    }

    #[DataProvider('loadingModes')]
    public function test_many_parents_and_cross_map_matching(string $class, string $relation, array $ids, string $mode): void
    {
        foreach ([['a'], ['a', 'b']] as $mapKeys) {
            $query = $class::whereIn('map_id', array_map(fn ($key) => $this->maps[$key], $mapKeys))->whereIn('id', $ids)->orderBy('map_id')->orderBy('id');
            $this->logQueries();
            $parents = $mode === 'with' ? $query->with($relation)->get() : $query->get()->$mode($relation);
            self::assertCount(count($ids) * count($mapKeys), $parents);
            foreach ($parents as $parent) {
                self::assertTrue($parent->relationLoaded($relation));
                self::assertSame($this->expected($relation, array_search($parent->map_id, $this->maps, true), $parent->id), $this->identities($parent->$relation));
            }
            $this->assertQueries(2);
            $this->logQueries();
            $parents->loadMissing($relation);
            $this->assertQueries(0);
            $parents->last()->unsetRelation($relation);
            $parents->loadMissing($relation);
            $last = $parents->last();
            self::assertSame($this->expected($relation, array_search($last->map_id, $this->maps, true), $last->id), $this->identities($last->$relation));
            $this->assertQueries(1);
        }
    }

    #[DataProvider('relations')]
    public function test_eager_query_fetches_only_requested_map_key_pairs(string $class, string $relation, array $ids): void
    {
        $parents = $class::where(fn ($q) => $q->where('map_id', $this->maps['a'])->where('id', $ids[0]))
            ->orWhere(fn ($q) => $q->where('map_id', $this->maps['b'])->where('id', $ids[1]))->get();
        $eager = $class::query()->getRelation($relation);
        $eager->addEagerConstraints($parents->all());
        $expected = array_unique([...$this->expected($relation, 'a', $ids[0]), ...$this->expected($relation, 'b', $ids[1])]);
        sort($expected);
        $this->logQueries();
        self::assertSame($expected, $this->identities($eager->getEager()));
        $this->assertQueries(1);
    }

    #[DataProvider('relations')]
    public function test_missing_target_never_resolves_in_another_map(string $class, string $relation, array $ids): void
    {
        // Synthetic parents cover missing references without disabling real FK constraints.
        $parent = new $class(['map_id' => $this->maps['a'], 'id' => 'foreign-only', 'site_id' => 'foreign-only', 'device_id' => 'foreign-only']);
        $this->logQueries();
        self::assertSame([], $this->identities($parent->$relation));
        $this->assertQueries(1);
        foreach (['load', 'loadMissing'] as $mode) {
            $parent->unsetRelation($relation);
            $this->logQueries();
            $parent->$mode($relation);
            self::assertSame([], $this->identities($parent->$relation));
            $this->assertQueries(1);
        }
    }

    #[DataProvider('relations')]
    public function test_missing_map_or_key_fails_closed(string $class, string $relation, array $ids): void
    {
        foreach ([
            ['id' => $ids[0], 'site_id' => 's1', 'device_id' => 'd1'],
            ['map_id' => $this->maps['a']],
        ] as $attributes) {
            $parent = new $class($attributes);
            self::assertSame([], $this->identities($parent->$relation));
            $parent->unsetRelation($relation)->load($relation);
            self::assertSame([], $this->identities($parent->$relation));
        }
        $parent = new $class(['map_id' => '0', 'id' => $ids[0], 'site_id' => 's1', 'device_id' => 'd1']);
        $eager = $class::query()->getRelation($relation);
        $eager->addEagerConstraints([$parent]);
        // A numeric PHP array key must not become an integer SQL binding (MySQL coercion).
        self::assertTrue(in_array('0', $eager->getQuery()->getBindings(), true));
    }

    #[DataProvider('relations')]
    public function test_existence_and_count_queries_keep_map_correlation(string $class, string $relation, array $ids): void
    {
        $this->logQueries();
        $parents = $class::whereIn('map_id', $this->maps)->whereIn('id', $ids)->withCount($relation)->withExists($relation)->get();
        foreach ($parents as $parent) {
            $count = count($this->expected($relation, array_search($parent->map_id, $this->maps, true), $parent->id));
            self::assertSame($count, $parent->getAttribute($relation.'_count'));
            self::assertSame($count > 0, $parent->getAttribute($relation.'_exists'));
        }
        $this->assertQueries(1);
        $this->logQueries();
        $filtered = $class::whereIn('map_id', $this->maps)->whereIn('id', $ids)
            ->whereHas($relation, fn ($q) => $q->where($q->qualifyColumn('map_id'), $this->maps['b']))->get();
        $expected = $parents->filter(fn ($row) => $row->map_id === $this->maps['b'] && $row->getAttribute($relation.'_count') > 0);
        self::assertSame($this->identities($expected), $this->identities($filtered));
        $this->assertQueries(1);
    }

    public function test_nested_loading_preserves_duplicate_ids_and_query_budget(): void
    {
        $this->logQueries();
        $sites = Site::with('devices.ports.device.site')->whereIn('map_id', $this->maps)->whereIn('id', ['s1', 's2', 'empty'])->get();
        foreach ($sites as $site) {
            $map = array_search($site->map_id, $this->maps, true);
            self::assertSame($this->expected('devices', $map, $site->id), $this->identities($site->devices));
            foreach ($site->devices as $device) {
                self::assertSame($this->expected('ports', $map, $device->id), $this->identities($device->ports));
                foreach ($device->ports as $port) {
                    self::assertSame([$device->map_id.'/'.$device->id], $this->identities($port->device));
                    self::assertSame([$site->map_id.'/'.$site->id], $this->identities($port->device->site));
                }
            }
        }
        $this->assertQueries(5);
    }

    public function test_fo_cable_and_core_relations_keep_map_pairs(): void
    {
        foreach ($this->maps as $map) {
            DB::table('cables')->insert(['map_id' => $map, 'id' => 'c1', 'code' => 'C1', 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
            DB::table('fiber_cable_details')->insert(['map_id' => $map, 'cable_id' => 'c1', 'total_cores' => 2, 'fiber_type' => 'single_mode']);
            DB::table('fiber_cores')->insert(['map_id' => $map, 'id' => 'f1', 'cable_id' => 'c1', 'core_number' => 1]);
        }
        $cables = Cable::whereIn('map_id', $this->maps)->with(['fromSite', 'toSite', 'cores'])->get();
        self::assertCount(2, $cables);
        foreach ($cables as $cable) {
            self::assertSame($cable->map_id, $cable->fromSite?->map_id);
            self::assertSame($cable->map_id, $cable->toSite?->map_id);
            self::assertSame([$cable->map_id.'/f1'], $this->identities($cable->cores));
        }
        $cores = FiberCore::whereIn('map_id', $this->maps)->with('cable')->get();
        self::assertCount(2, $cores);
        foreach ($cores as $core) self::assertSame($core->map_id, $core->cable?->map_id);

        DB::table('cables')->insert(['map_id' => $this->maps['b'], 'id' => 'b-only', 'code' => 'B-ONLY', 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 1, 'status' => '{}']);
        foreach ([
            ['cables', ['map_id' => $this->maps['a'], 'id' => 'wrong-site', 'code' => 'WRONG-SITE', 'kind' => 'fiber', 'from_site_id' => 'foreign-only', 'to_site_id' => 's2', 'length_m' => 1, 'status' => '{}']],
            ['fiber_cores', ['map_id' => $this->maps['a'], 'id' => 'wrong-cable', 'cable_id' => 'b-only', 'core_number' => 1]],
            ['cables', ['map_id' => $this->maps['a'], 'id' => 'duplicate-code', 'code' => 'C1', 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 1, 'status' => '{}']],
        ] as [$table, $row]) {
            try { DB::table($table)->insert($row); self::fail('Expected scoped FK or unique rejection.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        }
    }

    public function test_power_cable_and_terminal_relations_keep_map_pairs(): void
    {
        foreach ($this->maps as $map) {
            DB::table('device_ports')->where('map_id', $map)->where('id', 'p1')->update(['type' => 'terminal']);
            DB::table('cables')->insert(['map_id' => $map, 'id' => 'pc1', 'code' => 'PC1', 'kind' => 'power', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{"state":"unknown","source":"manual"}']);
            DB::table('power_cable_details')->insert(['map_id' => $map, 'cable_id' => 'pc1', 'conductor_count' => 3, 'cross_section_mm2' => 10, 'voltage_v' => 230]);
        }
        $cables = Cable::whereIn('map_id', $this->maps)->where('id', 'pc1')->with(['fromSite', 'toSite'])->withCount('cores')->get();
        self::assertCount(2, $cables);
        foreach ($cables as $cable) {
            self::assertSame($cable->map_id, $cable->fromSite?->map_id);
            self::assertSame($cable->map_id, $cable->toSite?->map_id);
            self::assertSame(0, $cable->cores_count);
            $cable->unsetRelation('fromSite')->unsetRelation('toSite');
            self::assertSame($cable->map_id, $cable->fromSite?->map_id);
            self::assertSame($cable->map_id, $cable->toSite?->map_id);
        }
        $ports = Port::whereIn('map_id', $this->maps)->where('id', 'p1')->with('device.site')->get();
        foreach ($ports as $port) self::assertSame($port->map_id, $port->device?->site?->map_id);

        $cable = $cables->firstWhere('map_id', $this->maps['a']);
        $cable->length_m = 12;
        $cable->save();
        self::assertSame(12.0, (float) DB::table('cables')->where('map_id', $this->maps['a'])->where('id', 'pc1')->value('length_m'));
        self::assertSame(10.0, (float) DB::table('cables')->where('map_id', $this->maps['b'])->where('id', 'pc1')->value('length_m'));
        foreach ([
            fn () => DB::table('cables')->where('map_id', $this->maps['a'])->where('id', 'pc1')->update(['from_site_id' => 'foreign-only']),
            fn () => DB::table('cables')->insert(['map_id' => $this->maps['a'], 'id' => 'duplicate', 'code' => 'PC1', 'kind' => 'power', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 1, 'status' => '{}']),
            fn () => DB::table('cables')->where('map_id', $this->maps['a'])->where('id', 'pc1')->delete(),
        ] as $operation) {
            try { $operation(); self::fail('Expected scoped FK or unique rejection.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        }
        DB::table('power_cable_details')->where('map_id', $this->maps['a'])->where('cable_id', 'pc1')->delete();
        self::assertSame(1, DB::table('cables')->where('map_id', $this->maps['a'])->where('id', 'pc1')->delete());
        self::assertSame(1, DB::table('cables')->where('map_id', $this->maps['b'])->where('id', 'pc1')->count());
    }

    public function test_power_circuit_ordered_cables_keep_map_pairs(): void
    {
        foreach ($this->maps as $key => $map) {
            DB::table('device_ports')->where('map_id', $map)->whereIn('id', ['p1', 'p2'])->update(['type' => 'terminal']);
            foreach (['c1', 'c2'] as $id) {
                DB::table('cables')->insert(['map_id' => $map, 'id' => $id, 'code' => strtoupper($id), 'kind' => 'power', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
                DB::table('power_cable_details')->insert(['map_id' => $map, 'cable_id' => $id, 'conductor_count' => 3, 'cross_section_mm2' => 10, 'voltage_v' => 230]);
            }
            DB::table('power_circuits')->insert(['map_id' => $map, 'id' => 'pc1', 'code' => 'PC1', 'source_port_id' => 'p1', 'destination_port_id' => 'p2', 'supply_type' => $key === 'a' ? 'pln' : 'backup', 'status' => '{}']);
            foreach (($key === 'a' ? ['c1', 'c2'] : ['c2', 'c1']) as $sequence => $cable) DB::table('power_circuit_cables')->insert(['map_id' => $map, 'circuit_id' => 'pc1', 'cable_id' => $cable, 'sequence' => $sequence]);
        }
        foreach (PowerCircuit::whereIn('map_id', $this->maps)->get() as $circuit) {
            $expected = $circuit->map_id === $this->maps['a'] ? ['c1', 'c2'] : ['c2', 'c1'];
            self::assertSame($expected, $circuit->cables->pluck('id')->all());
        }
        $circuits = PowerCircuit::whereIn('map_id', $this->maps)->with('cables.fromSite')->withCount('cables')->get();
        self::assertCount(2, $circuits);
        foreach ($circuits as $circuit) {
            $expected = $circuit->map_id === $this->maps['a'] ? ['c1', 'c2'] : ['c2', 'c1'];
            self::assertSame(2, $circuit->cables_count);
            self::assertSame($expected, $circuit->cables->pluck('id')->all());
            foreach ($circuit->cables as $cable) self::assertSame($circuit->map_id, $cable->fromSite?->map_id);
        }
        DB::table('cables')->insert(['map_id' => $this->maps['b'], 'id' => 'b-only', 'code' => 'B-ONLY', 'kind' => 'power', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 1, 'status' => '{}']);
        DB::table('power_cable_details')->insert(['map_id' => $this->maps['b'], 'cable_id' => 'b-only', 'conductor_count' => 3, 'cross_section_mm2' => 10, 'voltage_v' => 230]);
        DB::table('power_circuit_cables')->insert(['map_id' => $this->maps['b'], 'circuit_id' => 'pc1', 'cable_id' => 'b-only', 'sequence' => 2]);
        try { DB::table('power_circuit_cables')->insert(['map_id' => $this->maps['a'], 'circuit_id' => 'pc1', 'cable_id' => 'b-only', 'sequence' => 2]); self::fail('Cross-map FK must reject circuit cable.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        self::assertSame([$this->maps['b']], PowerCircuit::whereIn('map_id', $this->maps)->whereHas('cables', fn ($q) => $q->where('cables.id', 'b-only'))->pluck('map_id')->all());
    }

    public function test_route_corridor_cables_keep_map_pairs(): void
    {
        foreach ($this->maps as $key => $map) {
            DB::table('route_corridors')->insert(['map_id' => $map, 'id' => 'route1', 'code' => 'ROUTE1', 'name' => $map.'/route1']);
            foreach (['fo', 'power', ...($key === 'b' ? ['b-only'] : [])] as $id) {
                DB::table('cables')->insert(['map_id' => $map, 'id' => $id, 'code' => strtoupper($id), 'kind' => $id === 'fo' ? 'fiber' : 'power', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
            }
            foreach (($key === 'a' ? ['fo', 'power'] : ['power', 'b-only']) as $id) DB::table('corridor_cables')->insert(['map_id' => $map, 'corridor_id' => 'route1', 'cable_id' => $id]);
        }
        foreach (RouteCorridor::whereIn('map_id', $this->maps)->get() as $route) {
            $expected = $route->map_id === $this->maps['a'] ? ['fo', 'power'] : ['b-only', 'power'];
            self::assertSame($expected, $route->cables->pluck('id')->sort()->values()->all());
            self::assertSame([$route->map_id], $route->cables->pluck('map_id')->unique()->values()->all());
        }
        $routes = RouteCorridor::whereIn('map_id', $this->maps)->with('cables.fromSite')->withCount('cables')->get();
        self::assertCount(2, $routes);
        foreach ($routes as $route) {
            $expected = $route->map_id === $this->maps['a'] ? ['fo', 'power'] : ['b-only', 'power'];
            self::assertSame(2, $route->cables_count);
            self::assertSame($expected, $route->cables->pluck('id')->sort()->values()->all());
            foreach ($route->cables as $cable) self::assertSame($route->map_id, $cable->fromSite?->map_id);
        }
        self::assertSame([$this->maps['b']], RouteCorridor::whereIn('map_id', $this->maps)->whereHas('cables', fn ($q) => $q->where('cables.id', 'b-only'))->pluck('map_id')->all());
        foreach ([
            fn () => DB::table('corridor_cables')->insert(['map_id' => $this->maps['a'], 'corridor_id' => 'route1', 'cable_id' => 'b-only']),
            fn () => DB::table('corridor_cables')->insert(['map_id' => $this->maps['a'], 'corridor_id' => 'route1', 'cable_id' => 'fo']),
            fn () => DB::table('cables')->where('map_id', $this->maps['a'])->where('id', 'fo')->delete(),
        ] as $operation) {
            try { $operation(); self::fail('Expected scoped FK or unique rejection.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        }
    }

    public function test_power_circuit_and_corridor_membership_stay_independent_across_maps(): void
    {
        foreach ($this->maps as $key => $map) {
            DB::table('device_ports')->where('map_id', $map)->whereIn('id', ['p1', 'p2'])->update(['type' => 'terminal']);
            foreach (['power-1' => 'power', 'power-2' => 'power', 'fo' => 'fiber'] as $id => $kind) {
                DB::table('cables')->insert(['map_id' => $map, 'id' => $id, 'code' => strtoupper($id), 'kind' => $kind, 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
            }
            DB::table('power_circuits')->insert(['map_id' => $map, 'id' => 'circuit', 'code' => 'CIRCUIT', 'source_port_id' => 'p1', 'destination_port_id' => 'p2', 'supply_type' => 'pln', 'status' => '{}']);
            DB::table('route_corridors')->insert(['map_id' => $map, 'id' => 'route', 'code' => 'ROUTE', 'name' => 'Route']);
            $power = $key === 'a' ? 'power-1' : 'power-2';
            DB::table('power_circuit_cables')->insert(['map_id' => $map, 'circuit_id' => 'circuit', 'cable_id' => $power, 'sequence' => 0]);
            foreach (['fo', $power] as $cable) DB::table('corridor_cables')->insert(['map_id' => $map, 'corridor_id' => 'route', 'cable_id' => $cable]);
        }
        foreach ($this->maps as $key => $map) {
            $expectedPower = $key === 'a' ? 'power-1' : 'power-2';
            $circuit = PowerCircuit::where('map_id', $map)->firstOrFail();
            $route = RouteCorridor::where('map_id', $map)->firstOrFail();
            self::assertSame([$expectedPower], $circuit->cables->pluck('id')->all());
            self::assertSame(['fo', $expectedPower], $route->cables->pluck('id')->sort()->values()->all());
            self::assertSame([$map], $circuit->cables->pluck('map_id')->unique()->all());
            self::assertSame([$map], $route->cables->pluck('map_id')->unique()->all());
        }
        $circuits = PowerCircuit::whereIn('map_id', $this->maps)->with('cables')->withCount('cables')->get()->keyBy('map_id');
        $routes = RouteCorridor::whereIn('map_id', $this->maps)->with('cables')->withCount('cables')->get()->keyBy('map_id');
        foreach ($this->maps as $key => $map) {
            $expectedPower = $key === 'a' ? 'power-1' : 'power-2';
            self::assertSame(1, $circuits[$map]->cables_count);
            self::assertSame([$expectedPower], $circuits[$map]->cables->pluck('id')->all());
            self::assertSame(2, $routes[$map]->cables_count);
            self::assertSame(['fo', $expectedPower], $routes[$map]->cables->pluck('id')->sort()->values()->all());
            self::assertSame(['fiber', 'power'], $routes[$map]->cables->pluck('kind')->sort()->values()->all());
        }
        DB::table('corridor_cables')->where('map_id', $this->maps['a'])->where('cable_id', 'power-1')->delete();
        self::assertSame(1, PowerCircuit::where('map_id', $this->maps['a'])->withCount('cables')->firstOrFail()->cables_count);
        self::assertSame(1, RouteCorridor::where('map_id', $this->maps['a'])->withCount('cables')->firstOrFail()->cables_count);
        self::assertSame(2, RouteCorridor::where('map_id', $this->maps['b'])->withCount('cables')->firstOrFail()->cables_count);
    }

    public function test_fo_termination_relations_keep_map_pairs(): void
    {
        foreach ($this->maps as $key => $map) {
            DB::table('device_ports')->where('map_id', $map)->where('id', 'p1')->update(['type' => 'fiber']);
            DB::table('cables')->insert(['map_id' => $map, 'id' => 'c1', 'code' => 'C1', 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
            DB::table('fiber_cable_details')->insert(['map_id' => $map, 'cable_id' => 'c1', 'total_cores' => 2, 'fiber_type' => 'single_mode']);
            DB::table('fiber_cores')->insert(['map_id' => $map, 'id' => 'f1', 'cable_id' => 'c1', 'core_number' => 1]);
            DB::table('fiber_terminations')->insert(['map_id' => $map, 'id' => 't1', 'fiber_core_id' => 'f1', 'port_id' => 'p1', 'end_side' => $key === 'a' ? 'a' : 'b']);
        }
        $terminations = FiberTermination::whereIn('map_id', $this->maps)->with(['core.cable', 'port.device.site'])->get();
        self::assertCount(2, $terminations);
        foreach ($terminations as $termination) {
            self::assertSame($termination->map_id, $termination->core?->map_id);
            self::assertSame($termination->map_id, $termination->core?->cable?->map_id);
            self::assertSame($termination->map_id, $termination->port?->map_id);
            self::assertSame($termination->map_id, $termination->port?->device?->site?->map_id);
        }
        $cores = FiberCore::whereIn('map_id', $this->maps)->with('terminations')->get();
        self::assertCount(2, $cores);
        foreach ($cores as $core) self::assertSame([$core->map_id.'/t1'], $this->identities($core->terminations));
        foreach ($terminations as $termination) {
            $termination->unsetRelation('core');
            $termination->unsetRelation('port');
            self::assertSame($termination->map_id, $termination->core?->map_id);
            self::assertSame($termination->map_id, $termination->port?->map_id);
        }
    }

    public function test_fo_splice_relations_keep_map_pairs(): void
    {
        foreach ($this->maps as $map) {
            DB::table('devices')->where('map_id', $map)->where('id', 'd1')->update(['type' => 'splice_closure']);
            foreach (['c1' => 'f1', 'c2' => 'f2'] as $cable => $core) {
                DB::table('cables')->insert(['map_id' => $map, 'id' => $cable, 'code' => $cable, 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
                DB::table('fiber_cable_details')->insert(['map_id' => $map, 'cable_id' => $cable, 'total_cores' => 2, 'fiber_type' => 'single_mode']);
                DB::table('fiber_cores')->insert(['map_id' => $map, 'id' => $core, 'cable_id' => $cable, 'core_number' => 1]);
            }
            DB::table('fiber_splices')->insert(['map_id' => $map, 'id' => 's1', 'from_fiber_core_id' => 'f1', 'to_fiber_core_id' => 'f2', 'closure_device_id' => 'd1']);
        }
        $splices = FiberSplice::whereIn('map_id', $this->maps)->with(['fromCore.cable', 'toCore.cable', 'closure.site'])->get();
        self::assertCount(2, $splices);
        foreach ($splices as $splice) {
            self::assertSame($splice->map_id, $splice->fromCore?->cable?->map_id);
            self::assertSame($splice->map_id, $splice->toCore?->cable?->map_id);
            self::assertSame($splice->map_id, $splice->closure?->site?->map_id);
            foreach (['fromCore', 'toCore', 'closure'] as $relation) {
                $splice->unsetRelation($relation);
                self::assertSame($splice->map_id, $splice->{$relation}?->map_id);
            }
        }
    }

    public function test_logical_link_ordered_cores_keep_map_pairs(): void
    {
        foreach ($this->maps as $key => $map) {
            DB::table('cables')->insert(['map_id' => $map, 'id' => 'c1', 'code' => 'C1', 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
            DB::table('fiber_cable_details')->insert(['map_id' => $map, 'cable_id' => 'c1', 'total_cores' => 2, 'fiber_type' => 'single_mode']);
            foreach (['f1' => 1, 'f2' => 2] as $id => $number) DB::table('fiber_cores')->insert(['map_id' => $map, 'id' => $id, 'cable_id' => 'c1', 'core_number' => $number]);
            DB::table('logical_links')->insert(['map_id' => $map, 'id' => 'l1', 'code' => 'L1', 'from_port_id' => 'p1', 'to_port_id' => 'p2', 'route_name' => $key === 'a' ? 'fo_ring_a' : 'fo_ring_b']);
            foreach (($key === 'a' ? ['f1', 'f2'] : ['f2', 'f1']) as $sequence => $core) {
                DB::table('logical_link_core_segments')->insert(['map_id' => $map, 'logical_link_id' => 'l1', 'fiber_core_id' => $core, 'sequence' => $sequence]);
            }
        }
        $links = LogicalLink::whereIn('map_id', $this->maps)->with('cores')->withCount('cores')->get();
        self::assertCount(2, $links);
        foreach ($links as $link) {
            $expected = $link->map_id === $this->maps['a'] ? ['f1', 'f2'] : ['f2', 'f1'];
            self::assertSame(2, $link->cores_count);
            self::assertSame(array_map(fn ($id) => $link->map_id.'/'.$id, $expected), $link->cores->map(fn ($core) => $core->map_id.'/'.$core->id)->all());
            $link->unsetRelation('cores');
            self::assertSame(array_map(fn ($id) => $link->map_id.'/'.$id, $expected), $link->cores->map(fn ($core) => $core->map_id.'/'.$core->id)->all());
        }
    }

    public function test_logical_link_identity_references_and_lifecycle(): void
    {
        $a = $this->maps['a'];
        $b = $this->maps['b'];
        foreach ([$a, $b] as $map) {
            DB::table('cables')->insert(['map_id' => $map, 'id' => 'c1', 'code' => 'C1', 'kind' => 'fiber', 'from_site_id' => 's1', 'to_site_id' => 's2', 'length_m' => 10, 'status' => '{}']);
            DB::table('fiber_cable_details')->insert(['map_id' => $map, 'cable_id' => 'c1', 'total_cores' => 1, 'fiber_type' => 'single_mode']);
            DB::table('fiber_cores')->insert(['map_id' => $map, 'id' => 'f1', 'cable_id' => 'c1', 'core_number' => 1]);
        }
        $link = LogicalLink::create(['map_id' => $a, 'id' => 'l1', 'code' => 'L1', 'from_port_id' => 'p1', 'to_port_id' => 'p2', 'route_name' => 'fo_ring_a']);
        DB::table('logical_links')->insert(['map_id' => $a, 'id' => 'l2', 'code' => 'L2', 'from_port_id' => 'p1', 'to_port_id' => 'p2', 'route_name' => 'fo_ring_b']);
        DB::table('logical_link_core_segments')->insert(['map_id' => $a, 'logical_link_id' => 'l1', 'fiber_core_id' => 'f1', 'sequence' => 0]);
        self::assertSame(['fo_ring_a', 'fo_ring_b'], LogicalLink::where('map_id', $a)->orderBy('id')->pluck('route_name')->all());
        foreach ([
            ['logical_links', ['map_id' => $a, 'id' => 'duplicate', 'code' => 'L1', 'from_port_id' => 'p1', 'to_port_id' => 'p2', 'route_name' => 'fo_ring_b']],
            ['logical_links', ['map_id' => $a, 'id' => 'cross-port', 'code' => 'L3', 'from_port_id' => 'foreign-only', 'to_port_id' => 'p2', 'route_name' => 'fo_ring_b']],
            ['logical_link_core_segments', ['map_id' => $b, 'logical_link_id' => 'l1', 'fiber_core_id' => 'f1', 'sequence' => 0]],
        ] as [$table, $row]) {
            try { DB::table($table)->insert($row); self::fail('Expected scoped FK or unique rejection.'); }
            catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        }
        $link->route_name = 'fo_ring_b';
        $link->save();
        self::assertSame('fo_ring_b', $link->fresh()->route_name);
        self::assertSame(['f1'], $link->fresh()->cores->pluck('id')->all());
        try { $link->delete(); self::fail('Referenced link must not be deleted.'); }
        catch (\Illuminate\Database\QueryException $error) { self::assertSame('23000', (string) $error->getCode()); }
        DB::table('logical_link_core_segments')->where('map_id', $a)->where('logical_link_id', 'l1')->delete();
        self::assertSame(1, $link->delete() ? 1 : 0);
        self::assertSame(1, DB::table('fiber_cores')->where('map_id', $a)->count());
    }
}
