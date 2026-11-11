<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\{InfrastructureMap, MapRevision, User};
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class MapWorkflow
{
    public function __construct(public InventoryStore $store, public MapRules $rules) {}

    public static function response(mixed $data, array $meta = [])
    {
        return \Illuminate\Http\JsonResponse::fromJsonString(MapRules::json(['data' => $data, 'meta' => ['apiVersion' => '1', 'schemaVersion' => 2] + $meta]));
    }

    public static function fail(int $status, string $code, string $message): never
    {
        throw new HttpResponseException(response()->json(['error' => compact('code', 'message')], $status));
    }

    public function map(string $mapId, bool $lock = false): InfrastructureMap
    {
        $query = InfrastructureMap::whereKey($mapId);
        if ($lock) $query->lockForUpdate();
        return $query->firstOrFail();
    }

    public function etag(InfrastructureMap $map): string { return '"draft:'.$map->draft_version.'"'; }

    public function match(InfrastructureMap $map, ?string $ifMatch): void
    {
        if ($ifMatch === null) self::fail(428, 'PRECONDITION_REQUIRED', 'If-Match draft wajib dikirim.');
        if ($ifMatch !== $this->etag($map)) self::fail(409, 'DRAFT_CONFLICT', 'Draft berubah. Muat ulang dan gabungkan perubahan sebelum menyimpan.');
    }

    public function draft(InfrastructureMap $map): array
    {
        return ['mapId' => $map->id, 'version' => $map->draft_version, 'status' => $map->draft_status, 'activeRevisionId' => $map->active_revision_id, 'content' => $this->store->content($map)];
    }

    public function audit(?User $actor, ?string $mapId, string $action, array $details): void
    {
        DB::table('audit_logs')->insert(['actor_id' => $actor?->id, 'map_id' => $mapId, 'action' => $action, 'details' => MapRules::json($details), 'created_at' => now()]);
    }

    public function edit(string $mapId, ?string $ifMatch, User $actor, callable $change, string $action): array
    {
        return DB::transaction(function () use ($mapId, $ifMatch, $actor, $change, $action) {
            $map = $this->map($mapId, true);
            $this->match($map, $ifMatch);
            $before = $this->store->content($map);
            $content = $change($before);
            $issues = $this->rules->inspect($content);
            if ($issues) self::fail(422, $issues[0]['code'], $issues[0]['path'].': '.$issues[0]['message']);
            if ($content['dataOrigin'] !== $map->data_origin) self::fail(422, 'IMMUTABLE_ORIGIN', 'Asal DEMO/production ditetapkan saat peta dibuat dan tidak boleh diganti.');
            $content = $this->rules->deriveAllocation($content);
            $this->store->replace($map, $content);
            $map->draft_version++;
            $map->draft_status = 'draft';
            $map->save();
            $this->audit($actor, $mapId, $action, ['version' => $map->draft_version, 'before' => $before, 'after' => $content]);
            return $this->draft($map);
        }, 3);
    }

    public function validate(string $mapId, ?string $ifMatch, User $actor): array
    {
        return DB::transaction(function () use ($mapId, $ifMatch, $actor) {
            $map = $this->map($mapId, true);
            $this->match($map, $ifMatch);
            $issues = $this->rules->inspect($this->store->content($map), true);
            $map->draft_status = $issues ? 'draft' : 'validated';
            $map->save();
            $this->audit($actor, $mapId, 'map.validate', ['version' => $map->draft_version, 'valid' => !$issues, 'issues' => $issues]);
            return ['valid' => !$issues, 'version' => $map->draft_version, 'issues' => $issues];
        }, 3);
    }

    public function publish(string $mapId, ?string $ifMatch, User $actor): MapRevision
    {
        return DB::transaction(function () use ($mapId, $ifMatch, $actor) {
            $map = $this->map($mapId, true);
            $this->match($map, $ifMatch);
            if ($map->draft_status !== 'validated') self::fail(409, 'VALIDATION_REQUIRED', 'Validasi draft saat ini sebelum publish.');
            $content = $this->store->content($map);
            if ($this->rules->inspect($content, true)) self::fail(422, 'INVALID_DRAFT', 'Draft tidak lagi valid.');
            $id = (string) Str::uuid();
            $timestamp = now()->utc()->format('Y-m-d\TH:i:s\Z');
            $snapshot = MapRules::json($content + ['mapId' => $mapId, 'revision' => $id, 'publishedAt' => $timestamp, 'status' => 'published']);
            $revision = MapRevision::create(['id' => $id, 'map_id' => $mapId, 'draft_version' => $map->draft_version, 'published_by' => $actor->id, 'published_at' => now(), 'snapshot' => $snapshot, 'checksum' => hash('sha256', $snapshot)]);
            $previous = $map->active_revision_id;
            $map->active_revision_id = $id;
            $map->draft_version++;
            $map->draft_status = 'draft';
            $map->save();
            $this->audit($actor, $mapId, 'map.publish', ['revision' => $id, 'previousRevision' => $previous, 'version' => $map->draft_version]);
            return $revision;
        }, 3);
    }

    public function rollback(string $mapId, ?string $ifMatch, User $actor, string $revisionId): void
    {
        DB::transaction(function () use ($mapId, $ifMatch, $actor, $revisionId) {
            $map = $this->map($mapId, true);
            $this->match($map, $ifMatch);
            MapRevision::where('map_id', $mapId)->whereKey($revisionId)->firstOrFail();
            $previous = $map->active_revision_id;
            $map->active_revision_id = $revisionId;
            $map->draft_version++;
            $map->draft_status = 'draft';
            $map->save();
            $this->audit($actor, $mapId, 'map.rollback', ['revision' => $revisionId, 'previousRevision' => $previous, 'version' => $map->draft_version]);
        }, 3);
    }
}
