<?php

declare(strict_types=1);

use App\Models\{Device, Port, Site};
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Support\Facades\{Artisan, DB};

require __DIR__.'/../vendor/autoload.php';

// ponytail: migration lifecycle runs only on a newly initialized owned disposable instance.
$checks = 0;
function verify(bool $condition, string $label): void
{
    global $checks;
    if (!$condition) throw new RuntimeException('FAIL '.$label);
    $checks++;
    echo 'PASS '.$label.PHP_EOL;
}

function normalizedPath(string $path): string
{
    return strtolower(rtrim(str_replace('\\', '/', $path), '/'));
}

try {
    $meta = json_decode(file_get_contents($argv[1] ?? ''), true, 32, JSON_THROW_ON_ERROR);
    $artifactRoot = realpath(__DIR__.'/../../../.artifacts');
    $data = realpath($meta['data']);
    if (!$artifactRoot || !$data || !preg_match('~/migration-(?:2a01b|3-02a)-[a-f0-9]{32}/data$~', normalizedPath($data))
        || !str_starts_with(normalizedPath($data), normalizedPath($artifactRoot).'/')
        || !is_int($meta['port']) || $meta['port'] < 1024 || $meta['port'] > 65535) {
        throw new RuntimeException('Only a fresh owned migration-test artifact instance is allowed.');
    }
    $run = dirname($data);
    $pdo = new PDO('mysql:host=127.0.0.1;port='.$meta['port'].';charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $identity = $pdo->query('SELECT @@version AS version, @@port AS port, @@datadir AS datadir, DATABASE() AS db')->fetch(PDO::FETCH_ASSOC);
    verify(str_starts_with($identity['version'], '8.4.') && (int) $identity['port'] === $meta['port']
        && normalizedPath($identity['datadir']) === normalizedPath($data) && $identity['db'] === null, 'fresh server identity');
    $databases = $pdo->query('SHOW DATABASES')->fetchAll(PDO::FETCH_COLUMN);
    verify(array_diff($databases, ['information_schema', 'mysql', 'performance_schema', 'sys']) === [], 'no existing user databases on instance');
    $database = 'senkom_migration_3_02a_'.bin2hex(random_bytes(8)).'_test';
    $pdo->exec('CREATE DATABASE `'.$database.'` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs');
    $identity['db'] = $database;
    $identity['app_env'] = 'testing';
    file_put_contents($run.'/database.json', json_encode($identity, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    echo 'DISPOSABLE '.json_encode($identity, JSON_THROW_ON_ERROR).PHP_EOL;

    $_ENV['APP_ENV'] = $_SERVER['APP_ENV'] = 'testing';
    $app = require __DIR__.'/../bootstrap/app.php';
    $app->afterBootstrapping(LoadConfiguration::class, function ($app) use ($meta, $database) {
        $app['config']->set([
            'app.env' => 'testing', 'senkom.map_id' => 'migration-demo',
            'database.default' => 'mysql',
            'database.connections.mysql' => [
                'driver' => 'mysql', 'host' => '127.0.0.1', 'port' => $meta['port'],
                'database' => $database, 'username' => 'root', 'password' => '',
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_0900_as_cs', 'prefix' => '', 'strict' => true,
            ],
        ]);
    });
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $guard = function () use ($app, $database, $data, $meta): void {
        $actual = DB::selectOne('SELECT @@port AS port, @@datadir AS datadir, DATABASE() AS db');
        verify($app->environment('testing') && $actual->db === $database && (int) $actual->port === $meta['port']
            && normalizedPath($actual->datadir) === normalizedPath($data), 'Laravel testing connection targets owned disposable database');
    };
    $artisan = function (string $command, array $options = []) use ($guard): void {
        $guard();
        $exit = Artisan::call($command, ['--database' => 'mysql', '--force' => true] + $options);
        echo 'ARTISAN '.$command.' exit='.$exit.PHP_EOL.Artisan::output();
        verify($exit === 0, $command);
    };
    $tables = fn () => array_map(fn ($row) => $row->name, DB::select('SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME'));
    $snapshot = function () use ($tables): array {
        $ddl = [];
        foreach ($tables() as $table) $ddl[$table] = array_values((array) DB::selectOne('SHOW CREATE TABLE `'.$table.'`'))[1];
        return ['tables' => $ddl, 'triggers' => DB::select('SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING, ACTION_STATEMENT FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE() ORDER BY TRIGGER_NAME')];
    };
    $guard();
    verify($tables() === [], 'disposable database starts with zero tables');
    $artisan('migrate');
    $expectedTables = ['audit_logs', 'cables', 'camera_sources', 'cameras', 'corridor_cables', 'device_ports', 'devices', 'fiber_cable_details', 'fiber_cores', 'fiber_splices', 'fiber_terminations', 'logical_link_core_segments', 'logical_links', 'map_edges', 'map_nodes', 'map_revisions', 'maps', 'migrations', 'power_cable_details', 'power_circuit_cables', 'power_circuits', 'route_corridors', 'sites', 'user_map_roles', 'users', 'viewer_tokens'];
    verify($tables() === $expectedTables, 'all 24 application tables plus migrations ledger created');
    verify(DB::table('migrations')->count() === 3, 'all three migrations applied');
    $before = $snapshot();
    verify(count($before['triggers']) === 4, 'four immutable history triggers created');
    file_put_contents($run.'/schema-up.json', json_encode($before, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    foreach (['sites', 'devices', 'device_ports'] as $table) {
        $indexes = DB::select('SELECT INDEX_NAME AS name, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND NON_UNIQUE = 0 GROUP BY INDEX_NAME', [$table]);
        $indexes = array_column($indexes, 'cols', 'name');
        verify(($indexes['PRIMARY'] ?? '') === 'map_id,id', $table.' composite PK');
        verify(in_array($table === 'device_ports' ? 'map_id,device_id,name' : 'map_id,code', $indexes, true), $table.' scoped unique index');
        $columns = DB::select('SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?', [$table]);
        $columns = array_column($columns, null, 'name');
        foreach (['map_id', 'id'] as $key) verify($columns[$key]->type === 'varchar(96)' && $columns[$key]->nullable === 'NO', $table.'.'.$key.' type/nullability');
        verify($columns['status']->type === 'json' && $columns['status']->nullable === 'NO', $table.' status JSON');
        if ($table === 'sites') foreach (['geography', 'metadata'] as $key) verify($columns[$key]->type === 'json' && $columns[$key]->nullable === 'YES', 'sites.'.$key.' nullable JSON');
    }
    foreach (['devices' => ['site_id', 'sites'], 'device_ports' => ['device_id', 'devices']] as $table => [$key, $target]) {
        $fk = DB::select('SELECT k.COLUMN_NAME AS col, k.REFERENCED_COLUMN_NAME AS ref, r.DELETE_RULE AS rule FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME AND r.TABLE_NAME=k.TABLE_NAME WHERE k.TABLE_SCHEMA=DATABASE() AND k.TABLE_NAME=? AND k.REFERENCED_TABLE_NAME=? ORDER BY k.ORDINAL_POSITION', [$table, $target]);
        verify(array_column($fk, 'col') === ['map_id', $key] && array_column($fk, 'ref') === ['map_id', 'id'] && array_unique(array_column($fk, 'rule')) === ['RESTRICT'], $table.' composite FK with RESTRICT');
    }
    $sourceColumns = DB::select('SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?', ['camera_sources']);
    $sourceColumns = array_column($sourceColumns, null, 'name');
    verify($sourceColumns['source_uri']->type === 'longtext' && $sourceColumns['source_uri']->nullable === 'NO', 'camera_sources encrypted payload has longtext capacity');
    verify($sourceColumns['enabled']->type === 'tinyint(1)' && $sourceColumns['enabled']->nullable === 'NO', 'camera_sources enabled defaults to safe boolean state');
    $sourceIndexes = DB::select('SELECT INDEX_NAME AS name, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND NON_UNIQUE = 0 GROUP BY INDEX_NAME', ['camera_sources']);
    $sourceIndexes = array_column($sourceIndexes, 'cols', 'name');
    verify(($sourceIndexes['PRIMARY'] ?? '') === 'map_id,id' && in_array('map_id,camera_id', $sourceIndexes, true), 'camera source map-scoped primary and camera uniqueness');
    $sourceFk = DB::select('SELECT k.COLUMN_NAME AS col, k.REFERENCED_COLUMN_NAME AS ref, r.DELETE_RULE AS rule FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME AND r.TABLE_NAME=k.TABLE_NAME WHERE k.TABLE_SCHEMA=DATABASE() AND k.TABLE_NAME=? AND k.REFERENCED_TABLE_NAME=? ORDER BY k.ORDINAL_POSITION', ['camera_sources', 'cameras']);
    verify(array_column($sourceFk, 'col') === ['map_id', 'camera_id'] && array_column($sourceFk, 'ref') === ['map_id', 'id'] && array_unique(array_column($sourceFk, 'rule')) === ['CASCADE'], 'camera source composite map-scoped camera FK cascades camera deletion');
    verify(DB::table('camera_sources')->count() === 0, 'private source migration creates no camera credentials or source defaults');

    DB::beginTransaction();
    $site = fn ($map, $id, $code) => ['map_id' => $map, 'id' => $id, 'code' => $code, 'name' => 'Synthetic site', 'type' => 'field_site', 'status' => '{}'];
    $device = fn ($map, $id, $code, $siteId) => ['map_id' => $map, 'id' => $id, 'code' => $code, 'site_id' => $siteId, 'type' => 'switch', 'status' => '{}'];
    $port = fn ($map, $id, $deviceId, $name) => ['map_id' => $map, 'id' => $id, 'device_id' => $deviceId, 'name' => $name, 'type' => 'ethernet', 'status' => '{}'];
    $camera = fn ($map, $id, $siteId) => ['map_id' => $map, 'id' => $id, 'code' => $id, 'site_id' => $siteId, 'name' => 'Synthetic camera', 'enabled' => true, 'created_at' => now(), 'updated_at' => now()];
    foreach (['a', 'b'] as $map) {
        DB::table('maps')->insert(['id' => $map, 'name' => 'Synthetic map', 'data_origin' => 'demo', 'width' => 100, 'height' => 100, 'layers' => '[]']);
        DB::table('sites')->insert($site($map, 'shared', 'same'));
        DB::table('devices')->insert($device($map, 'shared', 'same', 'shared'));
        DB::table('device_ports')->insert($port($map, 'shared', 'shared', 'same'));
        DB::table('cameras')->insert($camera($map, 'shared-camera', 'shared'));
    }
    verify(DB::table('device_ports')->count() === 2, 'same IDs/codes/names permitted across maps');
    DB::table('sites')->insert($site('b', 'only-b', 'only-b'));
    DB::table('cameras')->insert($camera('b', 'only-camera-b', 'only-b'));
    DB::table('devices')->insert($device('b', 'only-b', 'only-b', 'only-b'));
    DB::table('device_ports')->insert($port('b', 'other-port', 'only-b', 'same'));
    verify(DB::table('device_ports')->where('map_id', 'b')->where('name', 'same')->count() === 2, 'same port name permitted on different devices');
    $reject = function (string $label, int $errorCode, callable $operation): void {
        try { $operation(); } catch (QueryException $error) {
            verify((int) $error->errorInfo[1] === $errorCode && (string) $error->getCode() === '23000', $label.' rejected '.$errorCode);
            return;
        }
        throw new RuntimeException('FAIL '.$label.' was accepted');
    };
    $reject('camera cross-map site', 1452, fn () => DB::table('cameras')->insert($camera('a', 'bad-camera', 'only-b')));
    $reject('device missing site', 1452, fn () => DB::table('devices')->insert($device('a', 'bad', 'bad', 'missing')));
    $reject('port missing device', 1452, fn () => DB::table('device_ports')->insert($port('a', 'bad', 'missing', 'bad')));
    $reject('device cross-map site', 1452, fn () => DB::table('devices')->insert($device('a', 'bad', 'bad', 'only-b')));
    $reject('port cross-map device', 1452, fn () => DB::table('device_ports')->insert($port('a', 'bad', 'only-b', 'bad')));
    $source = ['map_id' => 'a', 'id' => 'source-a', 'camera_id' => 'shared-camera', 'source_type' => 'rtsp', 'source_uri' => 'encrypted-test-value', 'enabled' => false, 'created_at' => now(), 'updated_at' => now()];
    DB::table('camera_sources')->insert($source);
    $reject('camera source cross-map camera', 1452, fn () => DB::table('camera_sources')->insert(array_replace($source, ['id' => 'source-cross', 'camera_id' => 'only-camera-b'])));
    $reject('camera source duplicate per camera', 1062, fn () => DB::table('camera_sources')->insert(array_replace($source, ['id' => 'source-duplicate'])));
    DB::table('cameras')->where('map_id', 'a')->where('id', 'shared-camera')->delete();
    verify(DB::table('camera_sources')->where('map_id', 'a')->where('id', 'source-a')->doesntExist(), 'camera deletion cascades its private source');
    foreach (['sites' => $site('a', 'shared', 'new'), 'devices' => $device('a', 'shared', 'new', 'shared'), 'device_ports' => $port('a', 'shared', 'shared', 'new')] as $table => $row) {
        $reject($table.' duplicate PK', 1062, fn () => DB::table($table)->insert($row));
    }
    $reject('site duplicate code', 1062, fn () => DB::table('sites')->insert($site('a', 'new', 'same')));
    $reject('device duplicate code', 1062, fn () => DB::table('devices')->insert($device('a', 'new', 'same', 'shared')));
    $reject('port duplicate device/name', 1062, fn () => DB::table('device_ports')->insert($port('a', 'new', 'shared', 'same')));
    foreach (['sites', 'devices'] as $table) $reject($table.' referenced parent delete', 1451, fn () => DB::table($table)->where('map_id', 'a')->where('id', 'shared')->delete());
    $reject('map referenced parent delete', 1451, fn () => DB::table('maps')->where('id', 'a')->delete());
    DB::rollBack();
    verify(DB::table('maps')->count() === 0, 'synthetic integrity fixtures rolled back');

    $artisan('db:seed', ['--class' => 'Database\\Seeders\\DemoSeeder']);
    $map = DB::table('maps')->sole();
    verify($map->id === 'migration-demo' && $map->data_origin === 'demo' && str_contains($map->demo_label, 'DEMO'), 'DEMO marker and dedicated map');
    $fixture = json_decode(file_get_contents(__DIR__.'/../../../tests/fixtures/demo-map.v1.json'), true, 64, JSON_THROW_ON_ERROR);
    foreach (['sites' => 'sites', 'devices' => 'devices', 'device_ports' => 'ports'] as $table => $key) {
        verify(DB::table($table)->count() === count($fixture[$key]), $table.' seed count matches Phase 0 fixture');
    }
    verify(DB::table('users')->count() === 0 && DB::table('viewer_tokens')->count() === 0, 'seeder creates no accounts or credentials');
    verify(DB::table('camera_sources')->count() === 0, 'DEMO seeder creates no private camera sources');
    verify(DB::table('audit_logs')->where('action', 'map.seed_demo')->count() === 1, 'seed audit created');
    $sites = Site::with('devices.ports')->get();
    $deviceCount = $portCount = 0;
    foreach ($sites as $s) foreach ($s->devices as $d) {
        $deviceCount++;
        verify($d->site->map_id === $s->map_id && $d->site->id === $s->id, 'seed Device.site inverse');
        foreach ($d->ports as $p) {
            $portCount++;
            verify($p->device->map_id === $d->map_id && $p->device->id === $d->id, 'seed Port.device inverse');
        }
    }
    verify($deviceCount === Device::count() && $portCount === Port::count(), 'all seeded devices/ports reachable via eager relationships');
    $counts = [];
    foreach ($tables() as $table) $counts[$table] = DB::table($table)->count();
    file_put_contents($run.'/seed-counts.json', json_encode($counts, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    try {
        (new \Database\Seeders\DemoSeeder())->run();
        throw new LogicException('Second seed unexpectedly succeeded.');
    } catch (RuntimeException $error) {
        verify($error->getMessage() === 'Map already exists; seed will not overwrite it.', 'second seed explicitly refused (not idempotent)');
    }
    foreach ($counts as $table => $count) verify(DB::table($table)->count() === $count, $table.' count unchanged by refused second seed');

    $artisan('migrate:rollback');
    verify($tables() === ['migrations'] && DB::table('migrations')->count() === 0, 'rollback leaves only empty migration ledger');
    verify(DB::select('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE()') === [], 'rollback removes all triggers');
    verify(DB::select('SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE()') === [], 'rollback removes all foreign keys');
    file_put_contents($run.'/schema-down.json', json_encode($snapshot(), JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    $artisan('migrate');
    $after = $snapshot();
    file_put_contents($run.'/schema-reup.json', json_encode($after, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    // Rollback deletes ledger rows, but its next auto-increment ID legitimately advances.
    $normalizeLedger = function (array $schema): string {
        $schema['tables']['migrations'] = preg_replace('/ AUTO_INCREMENT=\d+/', '', $schema['tables']['migrations']);
        return json_encode($schema, JSON_THROW_ON_ERROR);
    };
    verify($normalizeLedger($after) === $normalizeLedger($before), 're-up schema and triggers match except ledger next ID');
    verify(DB::table('migrations')->count() === 3 && DB::table('maps')->count() === 0, 're-up ledger restored and application data empty');
    echo 'RESULT '.$checks.' checks PASS; database retained for inspection: '.$database.PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, get_class($error).': '.$error->getMessage().PHP_EOL);
    exit(1);
}
