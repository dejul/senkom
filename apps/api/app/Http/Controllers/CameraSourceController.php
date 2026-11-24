<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Services\{CameraSourceStore, MapWorkflow};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class CameraSourceController
{
    public function __construct(private CameraSourceStore $sources, private MapWorkflow $workflow) {}

    private function context(Request $request, string $cameraId): array
    {
        $mapId = $request->query('mapId', config('senkom.map_id'));
        if (!is_string($mapId) || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $mapId)) MapWorkflow::fail(422, 'MAP_ID', 'Map ID tidak valid.');
        if (!preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $cameraId) || !Camera::where('map_id', $mapId)->whereKey($cameraId)->exists()) abort(404);
        return [$mapId, $cameraId];
    }

    private function safe(string $mapId, string $cameraId): array
    {
        $source = $this->sources->findForCamera($mapId, $cameraId);
        return [
            'mapId' => $mapId,
            'cameraId' => $cameraId,
            'configured' => $source !== null,
            'enabled' => $source?->enabled ?? false,
            'sourceType' => $source?->source_type,
            'updatedAt' => $source?->updated_at?->toISOString(),
        ];
    }

    private function sourceInput(Request $request): array
    {
        $input = $request->json()->all();
        if (array_diff(array_keys($input), ['sourceType', 'sourceUri', 'enabled'])) MapWorkflow::fail(422, 'INPUT', 'Properti sumber tidak dikenal.');
        return $input;
    }

    public function show(Request $request, string $id)
    {
        [$mapId, $cameraId] = $this->context($request, $id);
        return MapWorkflow::response($this->safe($mapId, $cameraId));
    }

    public function create(Request $request, string $id)
    {
        [$mapId, $cameraId] = $this->context($request, $id);
        $input = $this->sourceInput($request);
        return DB::transaction(function () use ($request, $mapId, $cameraId, $input) {
            $this->sources->create($mapId, ['cameraId' => $cameraId] + $input);
            $this->workflow->audit($request->user(), $mapId, 'camera_source.create', ['cameraId' => $cameraId]);
            return MapWorkflow::response($this->safe($mapId, $cameraId))->setStatusCode(201);
        });
    }

    public function replace(Request $request, string $id)
    {
        [$mapId, $cameraId] = $this->context($request, $id);
        $input = $this->sourceInput($request);
        if (!array_key_exists('sourceUri', $input) || !array_key_exists('sourceType', $input)) MapWorkflow::fail(422, 'INPUT', 'Source URI dan tipe wajib diisi.');
        return DB::transaction(function () use ($request, $mapId, $cameraId, $input) {
            if (!$this->sources->updateForCamera($mapId, $cameraId, $input)) abort(404);
            $this->workflow->audit($request->user(), $mapId, 'camera_source.replace', ['cameraId' => $cameraId]);
            return MapWorkflow::response($this->safe($mapId, $cameraId));
        });
    }

    public function enabled(Request $request, string $id)
    {
        [$mapId, $cameraId] = $this->context($request, $id);
        $input = $request->json()->all();
        if (array_keys($input) !== ['enabled']) MapWorkflow::fail(422, 'INPUT', 'Hanya enabled dapat diubah.');
        return DB::transaction(function () use ($request, $mapId, $cameraId, $input) {
            if (!$this->sources->updateForCamera($mapId, $cameraId, $input)) abort(404);
            $this->workflow->audit($request->user(), $mapId, 'camera_source.enabled', ['cameraId' => $cameraId, 'enabled' => $input['enabled']]);
            return MapWorkflow::response($this->safe($mapId, $cameraId));
        });
    }

    public function delete(Request $request, string $id)
    {
        [$mapId, $cameraId] = $this->context($request, $id);
        if ($request->json()->all()) MapWorkflow::fail(422, 'INPUT', 'DELETE tidak menerima payload.');
        return DB::transaction(function () use ($request, $mapId, $cameraId) {
            if (!$this->sources->deleteForCamera($mapId, $cameraId)) abort(404);
            $this->workflow->audit($request->user(), $mapId, 'camera_source.delete', ['cameraId' => $cameraId]);
            return MapWorkflow::response($this->safe($mapId, $cameraId));
        });
    }
}
