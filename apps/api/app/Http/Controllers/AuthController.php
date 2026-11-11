<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MapWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, RateLimiter};

final class AuthController
{
    public function session(Request $request)
    {
        $user = User::find($request->session()->get('admin_id'));
        return MapWorkflow::response(['csrfToken' => $request->session()->token(), 'user' => $user?->enabled ? ['id' => $user->id, 'name' => $user->name, 'roles' => $user->roles] : null]);
    }

    public function login(Request $request, MapWorkflow $workflow)
    {
        $input = $request->validate(['email' => ['required', 'string', 'email', 'max:200'], 'password' => ['required', 'string', 'max:128']]);
        if (array_diff(array_keys($request->all()), ['email', 'password'])) MapWorkflow::fail(422, 'INPUT', 'Properti login tidak dikenal.');
        $key = 'login:'.hash('sha256', (string) $request->ip());
        if (RateLimiter::tooManyAttempts($key, 5)) MapWorkflow::fail(429, 'RATE_LIMITED', 'Batas login tercapai. Coba lagi setelah satu menit.');
        RateLimiter::hit($key, 60);
        $user = User::where('email', strtolower($input['email']))->first();
        $accepted = $user && $user->enabled && Hash::check($input['password'], $user->password) && ($user->permits('infrastructure_editor') || $user->permits('publisher'));
        $workflow->audit($accepted ? $user : null, null, $accepted ? 'auth.login' : 'auth.login_denied', []);
        if (!$accepted) MapWorkflow::fail(401, 'INVALID_LOGIN', 'Login ditolak.');
        $request->session()->regenerate();
        $request->session()->put('admin_id', $user->id);
        RateLimiter::clear($key);
        return $this->session($request);
    }

    public function logout(Request $request, MapWorkflow $workflow)
    {
        $user = User::find($request->session()->get('admin_id'));
        $workflow->audit($user, null, 'auth.logout', []);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return $this->session($request);
    }
}
