<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\MapWorkflow;

final class PlaybackOrigin
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        $allowed = config('senkom.playback.allowed_origins', []);
        if ($origin !== null && (!is_string($origin) || !in_array($origin, $allowed, true))) MapWorkflow::fail(403, 'ORIGIN_DENIED', 'Origin playback tidak diizinkan.');

        if ($request->isMethod('OPTIONS')) {
            if ($origin === null || $request->header('Access-Control-Request-Method') !== 'POST') MapWorkflow::fail(403, 'ORIGIN_DENIED', 'Preflight playback tidak diizinkan.');
            $requested = array_filter(array_map('trim', explode(',', strtolower((string) $request->header('Access-Control-Request-Headers')))));
            if (array_diff($requested, ['authorization', 'content-type'])) MapWorkflow::fail(403, 'ORIGIN_DENIED', 'Header preflight tidak diizinkan.');
            return response('', 204)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
                ->header('Access-Control-Max-Age', '600')
                ->header('Vary', 'Origin')
                ->header('Cache-Control', 'no-store');
        }

        $response = $next($request);
        if ($origin !== null) $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Vary', 'Origin');
        $response->headers->set('Cache-Control', 'no-store, private');
        return $response;
    }
}
