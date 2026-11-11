<?php

declare(strict_types=1);

use App\Models\{InfrastructureMap, User};
use App\Services\MapWorkflow;
use Illuminate\Support\Facades\{Artisan, DB};
use Illuminate\Support\Str;

Artisan::command('senkom:user {email} {--name=} {--roles=system_admin}', function () {
    $email = strtolower($this->argument('email'));
    $roles = explode(',', $this->option('roles'));
    $name = $this->option('name') ?: $email;
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 200 || strlen($name) > 200 || array_diff($roles, ['system_admin', 'publisher', 'infrastructure_editor']) || count($roles) !== count(array_unique($roles))) {
        $this->error('Invalid email, name or roles.'); return 1;
    }
    if (User::where('email', $email)->exists()) { $this->error('User exists; no overwrite.'); return 1; }
    $password = $this->secret('Password (12-128 characters)');
    if (!is_string($password) || strlen($password) < 12 || strlen($password) > 128 || $password !== $this->secret('Repeat password')) {
        $this->error('Password invalid or does not match.'); return 1;
    }
    DB::transaction(function () use ($email, $name, $roles, $password) {
        $user = User::create(['id' => (string) Str::uuid(), 'email' => $email, 'name' => $name, 'password' => $password, 'roles' => $roles]);
        app(MapWorkflow::class)->audit($user, null, 'auth.user_created_cli', ['roles' => $roles]);
    });
    $this->info('User created. No password logged.');
})->purpose('Provision an administrator with a hidden password prompt');

Artisan::command('senkom:map-role {email} {map} {role} {--revoke}', function () {
    $user = User::where('email', strtolower($this->argument('email')))->first();
    $mapId = $this->argument('map');
    $role = $this->argument('role');
    if (!$user || !InfrastructureMap::whereKey($mapId)->exists() || !in_array($role, ['infrastructure_editor', 'publisher'], true) || !in_array($role, $user->roles, true)) {
        $this->error('User, map or role invalid.'); return 1;
    }
    $query = DB::table('user_map_roles')->where('user_id', $user->id)->where('map_id', $mapId)->where('role', $role);
    if ($this->option('revoke')) $query->delete();
    else if (!$query->exists()) DB::table('user_map_roles')->insert(['user_id' => $user->id, 'map_id' => $mapId, 'role' => $role]);
    $this->info($this->option('revoke') ? 'Map role revoked.' : 'Map role granted.');
})->purpose('Grant or revoke a map role for an existing administrator');

Artisan::command('senkom:map {id} {--name=Infrastructure}', function () {
    $id = $this->argument('id');
    $name = $this->option('name');
    if (!preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $id) || strlen($name) < 1 || strlen($name) > 200) { $this->error('Invalid ID/name.'); return 1; }
    if (InfrastructureMap::find($id)) { $this->error('Map exists; no overwrite.'); return 1; }
    DB::transaction(function () use ($id, $name) {
        InfrastructureMap::create(['id' => $id, 'name' => $name, 'data_origin' => 'production', 'width' => 1600, 'height' => 900, 'layers' => ['fo_ring_a', 'fo_ring_b', 'power_main', 'power_backup']]);
        app(MapWorkflow::class)->audit(null, $id, 'map.created_cli', []);
    });
    $this->info('Empty draft created; no DEMO data.');
})->purpose('Create an empty infrastructure map; canvas units are independent of displays');

Artisan::command('senkom:viewer-token {name} {--map=} {--hours=24} {--output=}', function () {
    $id = $this->option('map') ?: config('senkom.map_id');
    $hours = filter_var($this->option('hours'), FILTER_VALIDATE_INT);
    $path = $this->option('output');
    $name = $this->argument('name');
    if (!$hours || $hours < 1 || $hours > 24 || !$path || strlen($name) > 200 || !InfrastructureMap::find($id)) { $this->error('Require existing map, name, 1-24 hours and --output path.'); return 1; }
    $file = @fopen($path, 'x');
    if (!$file) { $this->error('Cannot create token file; existing files are not overwritten.'); return 1; }
    try {
        @chmod($path, 0600);
        $token = bin2hex(random_bytes(32));
        DB::transaction(function () use ($id, $hours, $token, $name, $file) {
            DB::table('viewer_tokens')->insert(['id' => (string) Str::uuid(), 'name' => $name, 'map_id' => $id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHours($hours), 'created_at' => now(), 'updated_at' => now()]);
            if (fwrite($file, $token) !== strlen($token) || !fflush($file) || !fsync($file)) throw new \RuntimeException('Token file write failed.');
            app(MapWorkflow::class)->audit(null, $id, 'auth.viewer_token_created_cli', ['hours' => $hours]);
        });
    } catch (\Throwable $error) {
        fclose($file);
        @unlink($path);
        throw $error;
    }
    fclose($file);
    $this->info('Viewer token written to requested file; expires in '.$hours.' hours. Protect the file and remove it after provisioning.');
})->purpose('Issue a map-scoped read-only token without printing its value');

Artisan::command('senkom:revoke-viewer {id}', function () {
    $id = $this->argument('id');
    $token = DB::table('viewer_tokens')->where('id', $id)->first();
    if (!$token) { $this->error('Token ID not found.'); return 1; }
    DB::transaction(function () use ($id, $token) {
        DB::table('viewer_tokens')->where('id', $id)->update(['revoked_at' => now(), 'updated_at' => now()]);
        app(MapWorkflow::class)->audit(null, $token->map_id, 'auth.viewer_token_revoked_cli', ['id' => $id]);
    });
    $this->info('Viewer token revoked.');
});
