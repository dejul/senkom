<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\{Camera, Cable, Device, FiberCore, FiberSplice, FiberTermination, InfrastructureMap, LogicalLink, MapEdge, MapNode, Port, PowerCircuit, RouteCorridor, Site};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class InventoryStore
{
    public const RESOURCES = [
        'sites' => ['sites', Site::class],
        'devices' => ['devices', Device::class],
        'ports' => ['ports', Port::class],
        'cables' => ['cables', Cable::class],
        'fiber-cores' => ['fiberCores', FiberCore::class],
        'fiber-terminations' => ['fiberTerminations', FiberTermination::class],
        'fiber-splices' => ['fiberSplices', FiberSplice::class],
        'logical-links' => ['logicalLinks', LogicalLink::class],
        'power-circuits' => ['powerCircuits', PowerCircuit::class],
        'route-corridors' => ['routes', RouteCorridor::class],
        'cameras' => ['cameras', Camera::class],
        'map-nodes' => ['nodes', MapNode::class],
        'map-edges' => ['edges', MapEdge::class],
    ];
    private const JOINS = [
        'logicalLinks' => ['logical_link_core_segments', 'logical_link_id', 'fiber_core_id', 'coreSegments'],
        'powerCircuits' => ['power_circuit_cables', 'circuit_id', 'cable_id', 'cableIds'],
        'routes' => ['corridor_cables', 'corridor_id', 'cable_id', 'cableIds'],
    ];
    private const TABLES = ['sites', 'devices', 'device_ports', 'cables', 'fiber_cable_details', 'power_cable_details', 'fiber_cores', 'fiber_terminations', 'fiber_splices', 'logical_links', 'logical_link_core_segments', 'power_circuits', 'power_circuit_cables', 'route_corridors', 'corridor_cables', 'cameras', 'map_nodes', 'map_edges'];

    public function rows(string $mapId, string $resource, ?int $page = null, int $perPage = 50): array
    {
        [$key, $class] = self::RESOURCES[$resource];
        $query = $class::query()->where('map_id', $mapId)->orderBy('id');
        if ($page !== null) $query->offset(($page - 1) * $perPage)->limit($perPage);
        $rows = $query->get()->map(function ($model) {
            $row = [];
            foreach ($model->attributesToArray() as $key => $value) {
                if (!in_array($key, ['map_id', 'created_at', 'updated_at'], true) && $value !== null) $row[Str::camel($key)] = $value;
            }
            return $row;
        })->all();
        $ids = array_column($rows, 'id');
        if ($key === 'cables') {
            $details = [];
            foreach (['fiber_cable_details', 'power_cable_details'] as $table) {
                foreach (DB::table($table)->where('map_id', $mapId)->whereIn('cable_id', $ids)->get() as $row) {
                    foreach ((array) $row as $name => $value) {
                        if (!in_array($name, ['map_id', 'cable_id'], true)) $details[$row->cable_id][Str::camel($name)] = $value;
                    }
                }
            }
            foreach ($rows as &$row) $row += $details[$row['id']] ?? [];
            unset($row);
        }
        if (isset(self::JOINS[$key])) {
            [$table, $parent, $child, $field] = self::JOINS[$key];
            $query = DB::table($table)->where('map_id', $mapId)->whereIn($parent, $ids)->orderBy($parent)->orderBy($key === 'routes' ? $child : 'sequence');
            $children = [];
            foreach ($query->get() as $row) $children[$row->{$parent}][] = $row->{$child};
            foreach ($rows as &$row) $row[$field] = $children[$row['id']] ?? [];
            unset($row);
        }
        if ($key === 'fiberCores') {
            $allocated = DB::table('logical_link_core_segments')->where('map_id', $mapId)->whereIn('fiber_core_id', $ids)->pluck('fiber_core_id')->flip()->all();
            foreach ($rows as &$row) {
                $row['status'] = $row['condition'] === 'usable' ? (isset($allocated[$row['id']]) ? 'allocated' : 'unallocated') : $row['condition'];
                unset($row['condition']);
            }
            unset($row);
        }
        return $rows;
    }

    public function content(InfrastructureMap $map): array
    {
        $content = ['schemaVersion' => 2, 'dataOrigin' => $map->data_origin, 'layers' => $map->layers];
        if ($map->data_origin === 'demo') $content['demoLabel'] = $map->demo_label;
        $layout = ['width' => $map->width, 'height' => $map->height];
        foreach (self::RESOURCES as $resource => [$key]) {
            $rows = $this->rows($map->id, $resource);
            if (in_array($key, ['nodes', 'edges'], true)) $layout[$key] = $rows;
            else $content[$key] = $rows;
        }
        $content['layout'] = $layout;
        return $content;
    }

    public function replace(InfrastructureMap $map, array $content): void
    {
        // Caller holds the map row lock; replacement and audit commit as one transaction.
        $created = [];
        foreach (self::RESOURCES as [, $class]) {
            $table = (new $class())->getTable();
            $created[$table] = DB::table($table)->where('map_id', $map->id)->pluck('created_at', 'id')->all();
        }
        $cameraIds = array_column($content['cameras'] ?? [], 'id');
        $privateSources = $cameraIds === [] ? [] : DB::table('camera_sources')->where('map_id', $map->id)->whereIn('camera_id', $cameraIds)->get()->all();
        foreach (array_reverse(self::TABLES) as $table) DB::table($table)->where('map_id', $map->id)->delete();
        $now = now()->format('Y-m-d H:i:s');
        $details = ['fiber_cable_details' => [], 'power_cable_details' => []];
        $relations = [];
        foreach (self::RESOURCES as [$key, $class]) {
            $records = $content[$key] ?? $content['layout'][$key];
            $table = (new $class())->getTable();
            $inserts = [];
            foreach ($records as $record) {
                if ($key === 'cables') {
                    $names = $record['kind'] === 'fiber' ? ['totalCores', 'fiberType'] : ['conductorCount', 'crossSectionMm2', 'voltageV'];
                    $detail = ['map_id' => $map->id, 'cable_id' => $record['id']];
                    foreach ($names as $name) {
                        $detail[Str::snake($name)] = $record[$name];
                        unset($record[$name]);
                    }
                    $details[$record['kind'].'_cable_details'][] = $detail;
                }
                if (isset(self::JOINS[$key])) {
                    [$join, $parent, $child, $field] = self::JOINS[$key];
                    foreach ($record[$field] as $sequence => $id) {
                        $row = ['map_id' => $map->id, $parent => $record['id'], $child => $id];
                        if ($key !== 'routes') $row['sequence'] = $sequence;
                        $relations[$join][] = $row;
                    }
                    unset($record[$field]);
                }
                if ($key === 'fiberCores') {
                    $record['condition'] = in_array($record['status'], ['allocated', 'unallocated'], true) ? 'usable' : $record['status'];
                    unset($record['status']);
                }
                $optional = match ($key) {
                    'sites' => ['description', 'geography', 'metadata'],
                    'devices' => ['model'],
                    'nodes' => ['label', 'symbol', 'zIndex', 'metadata'],
                    'edges' => ['label', 'zIndex', 'metadata'],
                    default => [],
                };
                foreach ($optional as $field) $record[$field] ??= null;
                $attributes = ['map_id' => $map->id, 'created_at' => $created[$table][$record['id']] ?? $now, 'updated_at' => $now];
                foreach ($record as $keyName => $value) $attributes[Str::snake($keyName)] = $value;
                $inserts[] = (new $class())->forceFill($attributes)->getAttributes();
            }
            foreach (array_chunk($inserts, 300) as $chunk) DB::table($table)->insert($chunk);
        }
        foreach ($details + $relations as $table => $rows) foreach (array_chunk($rows, 300) as $chunk) DB::table($table)->insert($chunk);
        // Source ciphertext is copied as opaque data; only sources for retained camera IDs return.
        foreach (array_chunk(array_map(fn ($row) => (array) $row, $privateSources), 300) as $chunk) DB::table('camera_sources')->insert($chunk);
        $map->fill([
            'data_origin' => $content['dataOrigin'], 'demo_label' => $content['demoLabel'] ?? null,
            'width' => $content['layout']['width'], 'height' => $content['layout']['height'], 'layers' => $content['layers'],
        ])->save();
    }
}
