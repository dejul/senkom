<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\{InfrastructureMap, User};
use App\Services\MapWorkflow;
use Closure;
use Illuminate\Http\Request;

final class AdminAccess
{
    public function handle(Request $request, Closure $next, string $role = 'read')
    {
        $user = User::find($request->session()->get('admin_id'));
        if (!$user || !$user->enabled) MapWorkflow::fail(401, 'UNAUTHENTICATED', 'Login administrator diperlukan.');
        if ($role === 'authenticated') return $next($request);
        $mapId = $request->query('mapId', config('senkom.map_id'));
        if (!is_string($mapId) || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $mapId)) MapWorkflow::fail(422, 'MAP_ID', 'Map ID tidak valid.');
        if (!InfrastructureMap::whereKey($mapId)->exists()) MapWorkflow::fail(403, 'FORBIDDEN', 'Akses map ditolak.');
        if ($role === 'infrastructure_editor' && $request->route('resource') === 'cameras') $role = 'system_admin';
        $allowed = $role === 'read'
            ? ($user->permits('infrastructure_editor', $mapId) || $user->permits('publisher', $mapId))
            : $user->permits($role === 'validate' ? 'publisher' : $role, $mapId);
        if (!$allowed) MapWorkflow::fail(403, 'FORBIDDEN', 'Akses map ditolak.');
        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
