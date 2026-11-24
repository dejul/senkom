<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\MapWorkflow;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class ViewerAccess
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        if (!is_string($token) || !preg_match('/\A[a-f0-9]{64}\z/', $token)) MapWorkflow::fail(401, 'UNAUTHENTICATED', 'Token viewer diperlukan.');
        $record = DB::table('viewer_tokens')->where('token_hash', hash('sha256', $token))->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        if (!$record) MapWorkflow::fail(401, 'UNAUTHENTICATED', 'Token viewer tidak valid atau kedaluwarsa.');
        $playbackIssue = $request->isMethod('POST') && $request->routeIs('viewer.playback.issue');
        if (!in_array($request->method(), ['GET', 'HEAD'], true) && !$playbackIssue) MapWorkflow::fail(403, 'VIEWER_READ_ONLY', 'Viewer hanya boleh membaca published data.');
        $request->attributes->set('viewer_map_id', $record->map_id);
        return $next($request);
    }
}
