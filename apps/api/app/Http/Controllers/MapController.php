<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\MapRevision;
use App\Services\{InventoryStore, MapRules, MapWorkflow};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class MapController
{
    public function __construct(private MapWorkflow $workflow) {}

    private function mapId(Request $request): string
    {
        $id = $request->query('mapId', config('senkom.map_id'));
        if (!is_string($id) || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $id)) MapWorkflow::fail(422, 'MAP_ID', 'Map ID tidak valid.');
        return $id;
    }

    private function draftResponse(array $draft)
    {
        return MapWorkflow::response($draft)->header('ETag', '"draft:'.$draft['version'].'"');
    }

    public function draft(Request $request)
    {
        return DB::transaction(fn () => $this->draftResponse($this->workflow->draft($this->workflow->map($this->mapId($request)))));
    }

    public function save(Request $request)
    {
        return $this->draftResponse($this->workflow->edit($this->mapId($request), $request->header('If-Match'), $request->user(), fn () => $request->json()->all(), 'map.save_draft'));
    }

    public function validateDraft(Request $request)
    {
        if ($request->json()->all()) MapWorkflow::fail(422, 'INPUT', 'Validasi memakai draft tersimpan, bukan payload baru.');
        return MapWorkflow::response($this->workflow->validate($this->mapId($request), $request->header('If-Match'), $request->user()));
    }

    public function publish(Request $request)
    {
        if ($request->json()->all()) MapWorkflow::fail(422, 'INPUT', 'Publish memakai draft tersimpan.');
        $revision = $this->workflow->publish($this->mapId($request), $request->header('If-Match'), $request->user());
        return MapWorkflow::response(['revisionId' => $revision->id, 'publishedAt' => $revision->published_at])->setStatusCode(201);
    }

    public function rollback(Request $request)
    {
        $input = $request->validate(['revisionId' => ['required', 'uuid']]);
        if (array_diff(array_keys($request->json()->all()), ['revisionId'])) MapWorkflow::fail(422, 'INPUT', 'Properti rollback tidak dikenal.');
        $this->workflow->rollback($this->mapId($request), $request->header('If-Match'), $request->user(), $input['revisionId']);
        return $this->draft($request);
    }

    private function page(Request $request): array
    {
        $input = $request->validate(['page' => ['sometimes', 'integer', 'min:1', 'max:1000000'], 'perPage' => ['sometimes', 'integer', 'min:1', 'max:100']]);
        return [(int) ($input['page'] ?? 1), (int) ($input['perPage'] ?? 50)];
    }

    public function index(Request $request, string $resource)
    {
        [$page, $perPage] = $this->page($request);
        return DB::transaction(function () use ($request, $resource, $page, $perPage) {
            $map = $this->workflow->map($this->mapId($request));
            [, $class] = InventoryStore::RESOURCES[$resource];
            return MapWorkflow::response($this->workflow->store->rows($map->id, $resource, $page, $perPage), ['page' => $page, 'perPage' => $perPage, 'total' => $class::where('map_id', $map->id)->count(), 'draftVersion' => $map->draft_version])->header('ETag', $this->workflow->etag($map));
        });
    }

    public function show(Request $request, string $resource, string $id)
    {
        return DB::transaction(function () use ($request, $resource, $id) {
            $map = $this->workflow->map($this->mapId($request));
            foreach ($this->workflow->store->rows($map->id, $resource) as $row) if ($row['id'] === $id) return MapWorkflow::response($row)->header('ETag', $this->workflow->etag($map));
            abort(404);
        });
    }

    public function mutate(Request $request, string $resource, ?string $id = null)
    {
        $draft = $this->workflow->edit($this->mapId($request), $request->header('If-Match'), $request->user(), function ($content) use ($request, $resource, $id) {
            [$key] = InventoryStore::RESOURCES[$resource];
            if (in_array($key, ['nodes', 'edges'], true)) $collection = &$content['layout'][$key];
            else $collection = &$content[$key];
            $found = array_search($id, array_column($collection, 'id'), true);
            $input = $request->json()->all();
            if ($request->isMethod('post')) {
                $collection[] = $input;
            } else {
                if ($found === false) abort(404);
                if ($request->isMethod('delete')) {
                    if ($input) MapWorkflow::fail(422, 'INPUT', 'DELETE tidak menerima payload.');
                    array_splice($collection, $found, 1);
                } else {
                    if (isset($input['id']) && $input['id'] !== $id) MapWorkflow::fail(422, 'IMMUTABLE_ID', 'ID objek tidak boleh diubah.');
                    $collection[$found] = $request->isMethod('patch') ? array_replace($collection[$found], $input) : $input;
                    if (($collection[$found]['id'] ?? null) !== $id) MapWorkflow::fail(422, 'IMMUTABLE_ID', 'ID objek wajib cocok.');
                }
            }
            return $content;
        }, 'inventory.'.strtolower($request->method()).'.'.$resource);
        return $this->draftResponse($draft)->setStatusCode($request->isMethod('post') ? 201 : 200);
    }

    public function layout(Request $request)
    {
        if ($request->isMethod('get')) return DB::transaction(function () use ($request) {
            $map = $this->workflow->map($this->mapId($request));
            return MapWorkflow::response($this->workflow->store->content($map)['layout'])->header('ETag', $this->workflow->etag($map));
        });
        return $this->draftResponse($this->workflow->edit($this->mapId($request), $request->header('If-Match'), $request->user(), function ($content) use ($request) {
            $content['layout'] = $request->json()->all();
            return $content;
        }, 'map.save_layout'));
    }

    public function revisions(Request $request)
    {
        [$page, $perPage] = $this->page($request);
        $query = MapRevision::where('map_id', $this->mapId($request));
        $total = (clone $query)->count();
        $rows = $query->orderByDesc('published_at')->orderByDesc('id')->offset(($page - 1) * $perPage)->limit($perPage)->get(['id', 'draft_version', 'published_at', 'published_by', 'checksum'])->map(fn ($r) => ['revisionId' => $r->id, 'draftVersion' => $r->draft_version, 'publishedAt' => $r->published_at, 'publishedBy' => $r->published_by, 'checksum' => $r->checksum])->all();
        return MapWorkflow::response($rows, compact('page', 'perPage', 'total'));
    }

    public function revision(Request $request, string $id)
    {
        $r = MapRevision::where('map_id', $this->mapId($request))->whereKey($id)->firstOrFail();
        return MapWorkflow::response(json_decode($r->snapshot, true, 64, JSON_THROW_ON_ERROR));
    }

    public function audit(Request $request)
    {
        [$page, $perPage] = $this->page($request);
        $query = DB::table('audit_logs')->where('map_id', $this->mapId($request));
        $total = (clone $query)->count();
        $rows = $query->orderByDesc('id')->offset(($page - 1) * $perPage)->limit($perPage)->get(['id', 'actor_id', 'action', 'created_at'])->map(fn ($r) => ['id' => $r->id, 'actorId' => $r->actor_id, 'action' => $r->action, 'createdAt' => $r->created_at])->all();
        return MapWorkflow::response($rows, compact('page', 'perPage', 'total'));
    }

    public function viewer(Request $request, ?string $resource = null, ?string $id = null)
    {
        $map = $this->workflow->map($request->attributes->get('viewer_map_id'));
        $revision = $map->activeRevision;
        if (!$revision) abort(404);
        if (!hash_equals($revision->checksum, hash('sha256', $revision->snapshot))) MapWorkflow::fail(503, 'SNAPSHOT_UNAVAILABLE', 'Snapshot tidak lolos pemeriksaan integritas.');
        try {
            $snapshot = json_decode($revision->snapshot, true, 64, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            MapWorkflow::fail(503, 'SNAPSHOT_UNAVAILABLE', 'Snapshot tidak lolos pemeriksaan integritas.');
        }
        if (!is_array($snapshot) || !$this->workflow->rules->schemaValid($snapshot, 'published-map.v2.json')) MapWorkflow::fail(503, 'SNAPSHOT_UNAVAILABLE', 'Snapshot tidak lolos pemeriksaan integritas.');
        $version = $request->query('schemaVersion', '1');
        if (!in_array($version, ['1', '2'], true)) MapWorkflow::fail(406, 'SCHEMA_UNSUPPORTED', 'Schema yang diminta tidak didukung.');
        if ($version === '1') $snapshot = $this->workflow->rules->projectV1($snapshot);
        if (!$snapshot) MapWorkflow::fail(406, 'SCHEMA_UNSUPPORTED', 'Revisi aktif memerlukan schema v2. Pertahankan cache kompatibel.');
        $data = $snapshot;
        if ($resource !== null) {
            $data = $snapshot[$resource];
            if ($id !== null) {
                $data = collect($data)->firstWhere('id', $id);
                if (!$data) abort(404);
            }
        }
        $body = MapRules::json(['data' => $data, 'meta' => ['apiVersion' => '1', 'schemaVersion' => (int) $version]]);
        $checksum = hash('sha256', $body);
        $etag = '"sha256:'.$checksum.'"';
        $headers = ['ETag' => $etag, 'X-Content-SHA256' => $checksum, 'Content-Type' => 'application/json'];
        if ($request->header('If-None-Match') === $etag) return response('', 304, $headers);
        return response($body, 200, $headers);
    }
}
