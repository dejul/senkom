<?php

declare(strict_types=1);

namespace App\Services;

use Opis\JsonSchema\Validator;

final class MapRules
{
    public const COLLECTIONS = ['sites', 'devices', 'ports', 'cables', 'fiberCores', 'fiberTerminations', 'fiberSplices', 'logicalLinks', 'powerCircuits', 'routes', 'cameras'];

    public static function json(mixed $value): string
    {
        $normalize = function (mixed $item) use (&$normalize): mixed {
            if (!is_array($item)) return $item;
            foreach ($item as $key => $child) {
                $item[$key] = $key === 'metadata' && $child === [] ? (object) [] : $normalize($child);
            }
            return $item;
        };
        return json_encode($normalize($value), JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    }

    public function schemaValid(mixed $value, string $file = 'map-content.v2.json'): bool
    {
        $schema = json_decode(file_get_contents(base_path('../../packages/map-schema/schema/'.$file)), false, 64, JSON_THROW_ON_ERROR);
        return (new Validator())->validate(json_decode(self::json($value)), $schema)->isValid();
    }

    public function inspect(array $content, bool $publication = false): array
    {
        if (!$this->schemaValid($content)) {
            return [['path' => '/', 'code' => 'SCHEMA', 'message' => 'Struktur, tipe atau properti tidak sesuai schema v2.']];
        }
        $issues = [];
        $check = function (bool $valid, string $path, string $code, string $message) use (&$issues): void {
            if (!$valid && count($issues) < 100) $issues[] = compact('path', 'code', 'message');
        };
        $index = [];
        foreach ([...self::COLLECTIONS, 'nodes', 'edges'] as $key) {
            $items = $content[$key] ?? $content['layout'][$key];
            $index[$key] = array_column($items, null, 'id');
            $check(count($index[$key]) === count($items), '/'.$key, 'DUPLICATE_ID', 'ID harus unik dalam koleksi.');
            $codes = array_column($items, 'code');
            $check(count(array_unique($codes)) === count($codes), '/'.$key, 'DUPLICATE_CODE', 'Kode harus unik dalam koleksi.');
        }
        foreach ($index['devices'] as $d) $check(isset($index['sites'][$d['siteId']]), '/devices', 'REFERENCE', 'Site perangkat tidak tersedia.');
        $portNames = [];
        foreach ($index['ports'] as $p) {
            $check(isset($index['devices'][$p['deviceId']]), '/ports', 'REFERENCE', 'Perangkat port tidak tersedia.');
            $key = $p['deviceId'].'/'.$p['name'];
            $check(!isset($portNames[$key]), '/ports', 'DUPLICATE_PORT', 'Nama port perangkat harus unik.');
            $portNames[$key] = true;
        }
        foreach ($index['cables'] as $c) {
            $check(isset($index['sites'][$c['fromSiteId']], $index['sites'][$c['toSiteId']]), '/cables', 'REFERENCE', 'Endpoint kabel tidak tersedia.');
        }
        $numbers = [];
        foreach ($index['fiberCores'] as $c) {
            $cable = $index['cables'][$c['cableId']] ?? null;
            $check($cable && $cable['kind'] === 'fiber' && $c['coreNumber'] <= $cable['totalCores'], '/fiberCores', 'CORE_CAPACITY', 'Core harus berada dalam kapasitas kabel FO.');
            $key = $c['cableId'].'/'.$c['coreNumber'];
            $check(!isset($numbers[$key]), '/fiberCores', 'DUPLICATE_CORE', 'Nomor core pada kabel harus unik.');
            $numbers[$key] = true;
        }
        $optical = fn (string $id): bool => in_array($index['ports'][$id]['type'] ?? '', ['sfp', 'fiber'], true);
        foreach ($index['fiberTerminations'] as $t) {
            $check(isset($index['fiberCores'][$t['fiberCoreId']]) && $optical($t['portId']), '/fiberTerminations', 'REFERENCE', 'Terminasi memerlukan core dan port optik.');
        }
        foreach ($index['fiberSplices'] as $s) {
            $check(isset($index['fiberCores'][$s['fromFiberCoreId']], $index['fiberCores'][$s['toFiberCoreId']]) && $s['fromFiberCoreId'] !== $s['toFiberCoreId'] && ($index['devices'][$s['closureDeviceId']]['type'] ?? '') === 'splice_closure', '/fiberSplices', 'REFERENCE', 'Splice memerlukan dua core berbeda dan splice closure.');
            $check(!isset($index['fiberTerminations'][$s['id']]), '/fiberSplices', 'AMBIGUOUS_ID', 'ID splice dan terminasi tidak boleh sama.');
        }
        $allocations = [];
        foreach ($index['logicalLinks'] as $l) {
            $check($optical($l['fromPortId']) && $optical($l['toPortId']) && $l['fromPortId'] !== $l['toPortId'], '/logicalLinks', 'REFERENCE', 'Link memerlukan port optik berbeda.');
            foreach ($l['coreSegments'] as $id) {
                $check(isset($index['fiberCores'][$id]), '/logicalLinks', 'REFERENCE', 'Core link tidak tersedia.');
                $check(!isset($allocations[$id]), '/logicalLinks', 'CORE_CONFLICT', 'Core dialokasikan pada lebih dari satu link.');
                $allocations[$id] = $l['id'];
            }
        }
        foreach ($index['powerCircuits'] as $c) {
            $check(($index['ports'][$c['sourcePortId']]['type'] ?? '') === 'terminal' && ($index['ports'][$c['destinationPortId']]['type'] ?? '') === 'terminal' && $c['sourcePortId'] !== $c['destinationPortId'], '/powerCircuits', 'REFERENCE', 'Sirkuit memerlukan terminal sumber dan beban berbeda.');
            foreach ($c['cableIds'] as $id) $check(($index['cables'][$id]['kind'] ?? '') === 'power', '/powerCircuits', 'REFERENCE', 'Sirkuit hanya boleh memakai kabel Power.');
        }
        foreach ($index['routes'] as $r) foreach ($r['cableIds'] as $id) $check(isset($index['cables'][$id]), '/routes', 'REFERENCE', 'Kabel koridor tidak tersedia.');
        foreach ($index['cameras'] as $c) $check(isset($index['sites'][$c['siteId']]), '/cameras', 'REFERENCE', 'Site kamera tidak tersedia.');
        $inBounds = fn (array $p): bool => $p['x'] <= $content['layout']['width'] && $p['y'] <= $content['layout']['height'];
        foreach ($index['nodes'] as $n) {
            $check(isset($index[$n['entityType'] === 'site' ? 'sites' : 'devices'][$n['entityId']]), '/layout/nodes', 'REFERENCE', 'Entitas node tidak tersedia.');
            $check($inBounds($n), '/layout/nodes', 'BOUNDS', 'Node di luar kanvas.');
        }
        foreach ($index['edges'] as $e) {
            $check(isset($index['nodes'][$e['fromNodeId']], $index['nodes'][$e['toNodeId']]), '/layout/edges', 'REFERENCE', 'Node endpoint edge tidak tersedia.');
            $power = str_starts_with($e['connectionType'], 'power_');
            $check(in_array($e['layer'], $content['layers'], true) && str_starts_with($e['layer'], $power ? 'power_' : 'fo_'), '/layout/edges', 'LAYER', 'Layer edge tidak sesuai jenis koneksi.');
            foreach ($e['points'] as $p) $check($inBounds($p), '/layout/edges', 'BOUNDS', 'Waypoint di luar kanvas.');
            $reference = match ($e['connectionType']) {
                'fiber_cable_segment' => ($index['cables'][$e['connectionId']]['kind'] ?? '') === 'fiber',
                'power_cable_segment' => ($index['cables'][$e['connectionId']]['kind'] ?? '') === 'power',
                'fiber_core_connection' => isset($index['fiberSplices'][$e['connectionId']]) || isset($index['fiberTerminations'][$e['connectionId']]),
                'logical_link' => ($index['logicalLinks'][$e['connectionId']]['routeName'] ?? '') === $e['layer'],
                'power_circuit' => isset($index['powerCircuits'][$e['connectionId']]),
            };
            $check($reference, '/layout/edges', 'REFERENCE', 'Koneksi edge tidak tersedia atau berbeda jenis.');
        }
        if ($issues) return $issues;

        $portSite = fn (string $port): string => $index['devices'][$index['ports'][$port]['deviceId']]['siteId'];
        $cableOf = fn (string $core): array => $index['cables'][$index['fiberCores'][$core]['cableId']];
        $endSite = fn (array $cable, string $side): string => $cable[$side === 'a' ? 'fromSiteId' : 'toSiteId'];
        $ends = [];
        $terminations = [];
        foreach ($index['fiberTerminations'] as $t) {
            $cable = $cableOf($t['fiberCoreId']);
            $key = $t['fiberCoreId'].'/'.$t['endSide'];
            $check($endSite($cable, $t['endSide']) === $portSite($t['portId']), '/fiberTerminations', 'WRONG_END', 'Terminasi berada pada site ujung kabel yang salah.');
            $check(!isset($ends[$key]), '/fiberTerminations', 'END_CONFLICT', 'Ujung core sudah tersambung.');
            $ends[$key] = true;
            $terminations[$key] = $t['portId'];
        }
        $spliced = [];
        foreach ($index['fiberSplices'] as $s) {
            $site = $index['devices'][$s['closureDeviceId']]['siteId'];
            $keys = [];
            foreach ([$s['fromFiberCoreId'], $s['toFiberCoreId']] as $id) {
                $cable = $cableOf($id);
                $sides = array_keys(array_filter(['a' => $cable['fromSiteId'], 'b' => $cable['toSiteId']], fn ($end) => $end === $site));
                $check(count($sides) === 1, '/fiberSplices', 'SPLICE_END', 'Closure harus berada pada satu ujung kabel yang tidak ambigu.');
                if (count($sides) !== 1) continue;
                $key = $id.'/'.$sides[0];
                $check(!isset($ends[$key]), '/fiberSplices', 'END_CONFLICT', 'Ujung core sudah diterminasi atau di-splice.');
                $ends[$key] = true;
                $keys[] = $key;
            }
            if (count($keys) === 2) {
                $spliced[$keys[0]] = $keys[1];
                $spliced[$keys[1]] = $keys[0];
            }
        }
        if (!$publication || $issues) return $issues;

        $usedPorts = [];
        foreach ($index['logicalLinks'] as $l) {
            foreach ([$l['fromPortId'], $l['toPortId']] as $port) {
                $check(!isset($usedPorts[$port]), '/logicalLinks', 'PORT_CONFLICT', 'Port link sudah dialokasikan.');
                $usedPorts[$port] = true;
            }
            $first = $l['coreSegments'][0];
            $entry = null;
            foreach (['a', 'b'] as $side) if (($terminations[$first.'/'.$side] ?? null) === $l['fromPortId']) $entry = $side;
            $check($entry !== null, '/logicalLinks', 'PATH_START', 'Core awal belum diterminasi ke port sumber.');
            if ($entry === null) continue;
            foreach ($l['coreSegments'] as $position => $id) {
                $check(!in_array($index['fiberCores'][$id]['status'], ['faulty', 'unknown'], true), '/logicalLinks', 'CORE_UNAVAILABLE', 'Core faulty/unknown tidak boleh dialokasikan.');
                $exit = $id.'/'.($entry === 'a' ? 'b' : 'a');
                $next = $l['coreSegments'][$position + 1] ?? null;
                if ($next === null) {
                    $check(($terminations[$exit] ?? null) === $l['toPortId'], '/logicalLinks', 'PATH_END', 'Core terakhir belum diterminasi ke port tujuan.');
                } else {
                    $joined = $spliced[$exit] ?? '';
                    $check(str_starts_with($joined, $next.'/'), '/logicalLinks', 'PATH_GAP', 'Path core tidak kontinu melalui splice eksplisit.');
                    if (!str_starts_with($joined, $next.'/')) break;
                    $entry = substr($joined, -1);
                }
            }
        }
        foreach ($index['powerCircuits'] as $c) {
            $device = $index['devices'][$index['ports'][$c['sourcePortId']]['deviceId']];
            $check(in_array($device['type'], ['source', 'ups', 'power_panel', 'pdu'], true), '/powerCircuits', 'POWER_SOURCE', 'Perangkat sumber bukan sumber/distribusi Power.');
            $check($c['supplyType'] !== 'ups' || $device['type'] === 'ups', '/powerCircuits', 'POWER_SOURCE', 'Supply UPS harus bersumber dari UPS.');
            $site = $portSite($c['sourcePortId']);
            foreach ($c['cableIds'] as $id) {
                $cable = $index['cables'][$id];
                $check(in_array($site, [$cable['fromSiteId'], $cable['toSiteId']], true), '/powerCircuits', 'POWER_GAP', 'Urutan kabel Power tidak kontinu.');
                $site = $site === $cable['fromSiteId'] ? $cable['toSiteId'] : $cable['fromSiteId'];
            }
            $check($site === $portSite($c['destinationPortId']), '/powerCircuits', 'POWER_DESTINATION', 'Path Power tidak berakhir pada site beban.');
        }
        $nodeSite = fn (array $n): string => $n['entityType'] === 'site' ? $n['entityId'] : $index['devices'][$n['entityId']]['siteId'];
        foreach ($index['edges'] as $e) {
            $from = $index['nodes'][$e['fromNodeId']];
            $to = $index['nodes'][$e['toNodeId']];
            foreach ($e['points'] as $i => $p) {
                $previous = $e['points'][$i - 1] ?? $p;
                $check($previous['x'] == $p['x'] || $previous['y'] == $p['y'], '/layout/edges', 'ORTHOGONAL', 'Waypoint harus membentuk garis horizontal atau vertikal.');
            }
            $start = $e['points'][0];
            $end = $e['points'][count($e['points']) - 1];
            $check($start['x'] == $from['x'] && $start['y'] == $from['y'] && $end['x'] == $to['x'] && $end['y'] == $to['y'], '/layout/edges', 'EDGE_ENDPOINT', 'Waypoint ujung harus mengikuti posisi node.');
            $expected = match ($e['connectionType']) {
                'fiber_cable_segment', 'power_cable_segment' => [$index['cables'][$e['connectionId']]['fromSiteId'], $index['cables'][$e['connectionId']]['toSiteId']],
                'logical_link' => [$portSite($index['logicalLinks'][$e['connectionId']]['fromPortId']), $portSite($index['logicalLinks'][$e['connectionId']]['toPortId'])],
                'power_circuit' => [$portSite($index['powerCircuits'][$e['connectionId']]['sourcePortId']), $portSite($index['powerCircuits'][$e['connectionId']]['destinationPortId'])],
                default => null,
            };
            if ($expected) {
                $actual = [$nodeSite($from), $nodeSite($to)];
                $check($actual === $expected || array_reverse($actual) === $expected, '/layout/edges', 'EDGE_CONNECTIVITY', 'Node visual tidak sesuai endpoint koneksi fisik/logis.');
            }
        }
        return $issues;
    }

    public function deriveAllocation(array $content): array
    {
        $allocated = [];
        foreach ($content['logicalLinks'] as $link) foreach ($link['coreSegments'] as $id) $allocated[$id] = true;
        foreach ($content['fiberCores'] as &$core) {
            if (in_array($core['status'], ['allocated', 'unallocated'], true)) $core['status'] = isset($allocated[$core['id']]) ? 'allocated' : 'unallocated';
        }
        return $content;
    }

    public function projectV1(array $snapshot): ?array
    {
        $schema = json_decode(file_get_contents(base_path('../../packages/map-schema/schema/published-map.v1.json')), true, 64, JSON_THROW_ON_ERROR);
        $snapshot['schemaVersion'] = 1;
        unset($snapshot['mapId']);
        foreach (['sites' => 'Site', 'devices' => 'Device'] as $key => $definition) {
            foreach ($snapshot[$key] as &$item) $item = array_intersect_key($item, $schema['$defs'][$definition]['properties']);
            unset($item);
        }
        foreach (['nodes' => 'MapNode', 'edges' => 'MapEdge'] as $key => $definition) {
            foreach ($snapshot['layout'][$key] as &$item) $item = array_intersect_key($item, $schema['$defs'][$definition]['properties']);
            unset($item);
        }
        return $this->schemaValid($snapshot, 'published-map.v1.json') ? $snapshot : null;
    }
}
