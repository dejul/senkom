<?php

declare(strict_types=1);

require __DIR__.'/../apps/api/vendor/autoload.php';
$app = require __DIR__.'/../apps/api/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (!app()->environment('testing') || !str_ends_with(config('database.connections.mysql.database'), '_test') || config('database.connections.mysql.host') !== '127.0.0.1') throw new RuntimeException('Smoke requires isolated loopback *_test database.');
$path = $argv[1] ?? '';
$file = @fopen($path, 'x');
if (!$file) throw new RuntimeException('Credential fixture must use a new file.');
try {
    @chmod($path, 0600);
    \Illuminate\Support\Facades\DB::transaction(function () use ($file) {
        (new \Database\Seeders\DemoSeeder())->run();
        $mapId = config('senkom.map_id');
        $password = bin2hex(random_bytes(24));
        $email = $mapId.'@example.invalid';
        \App\Models\User::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'DEMO smoke admin', 'email' => $email, 'password' => $password, 'roles' => ['system_admin']]);
        $editorEmail = 'editor-'.$email;
        $editor = \App\Models\User::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'DEMO smoke editor', 'email' => $editorEmail, 'password' => $password, 'roles' => ['infrastructure_editor']]);
        \Illuminate\Support\Facades\DB::table('user_map_roles')->insert(['user_id' => $editor->id, 'map_id' => $mapId, 'role' => 'infrastructure_editor']);
        $secondEditorEmail = 'second-'.$editorEmail;
        $secondEditor = \App\Models\User::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'DEMO smoke second editor', 'email' => $secondEditorEmail, 'password' => $password, 'roles' => ['infrastructure_editor']]);
        \Illuminate\Support\Facades\DB::table('user_map_roles')->insert(['user_id' => $secondEditor->id, 'map_id' => $mapId, 'role' => 'infrastructure_editor']);
        $viewerToken = bin2hex(random_bytes(32));
        \Illuminate\Support\Facades\DB::table('viewer_tokens')->insert(['id' => (string) \Illuminate\Support\Str::uuid(), 'map_id' => $mapId, 'name' => 'DEMO smoke viewer', 'token_hash' => hash('sha256', $viewerToken), 'expires_at' => now()->addHour(), 'created_at' => now(), 'updated_at' => now()]);
        $json = json_encode(compact('mapId', 'email', 'editorEmail', 'secondEditorEmail', 'password', 'viewerToken'), JSON_THROW_ON_ERROR);
        if (fwrite($file, $json) !== strlen($json)) throw new RuntimeException('Fixture write failed.');
    });
} finally { fclose($file); }
echo "Isolated DEMO API fixture ready.\n";
