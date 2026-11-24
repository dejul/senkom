<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\{MapWorkflow, PlaybackAuthorization};
use Illuminate\Http\Request;

final class PlaybackSessionController
{
    public function __construct(private PlaybackAuthorization $playback) {}

    public function issue(Request $request, string $mapId, string $id)
    {
        if ($request->attributes->get('viewer_map_id') !== $mapId) MapWorkflow::fail(403, 'FORBIDDEN', 'Akses map ditolak.');
        $input = $request->json()->all();
        if (array_diff(array_keys($input), ['protocol']) || !is_string($input['protocol'] ?? null)) MapWorkflow::fail(422, 'INPUT', 'Protokol playback tidak valid.');
        return MapWorkflow::response($this->playback->issue((string) $request->bearerToken(), $mapId, $id, $input['protocol']))
            ->header('Cache-Control', 'no-store, private')
            ->header('Pragma', 'no-cache');
    }

    public function gatewayAuth(Request $request)
    {
        if (strlen($request->getContent()) > 8192) return response('', 401)->header('Cache-Control', 'no-store');
        if ($this->playback->authorizeGateway($request->json()->all())) return response('', 204)->header('Cache-Control', 'no-store');
        return response('', 401)->header('Cache-Control', 'no-store');
    }

    public function preflight(Request $request)
    {
        return response()->noContent();
    }
}
