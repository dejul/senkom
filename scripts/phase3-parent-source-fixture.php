<?php

declare(strict_types=1);

function assertCiphertextAbsent(string $response, string $ciphertext): void
{
    if ($ciphertext === '' || str_contains($response, $ciphertext)) {
        throw new RuntimeException('Viewer metadata exposed stored source ciphertext.');
    }
}

if (($argv[1] ?? '') === 'canary-self-test') {
    $canary = 'synthetic-encrypted-canary';
    try {
        assertCiphertextAbsent($canary, $canary);
    } catch (RuntimeException $error) {
        if (str_contains($error->getMessage(), $canary)) throw new RuntimeException('Canary diagnostic leaked.');
        echo "PASS ciphertext canary rejects exposure without printing value.\n";
        exit(0);
    }
    throw new RuntimeException('Ciphertext canary failed to reject exposure.');
}

require __DIR__.'/../apps/api/vendor/autoload.php';
$app = require __DIR__.'/../apps/api/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CameraSource;
use App\Models\User;
use App\Services\CameraSourceStore;
use App\Services\MapWorkflow;
use Illuminate\Support\Facades\DB;

$mapId = config('senkom.map_id');
if (!app()->environment('testing') || !str_ends_with(config('database.connections.mysql.database'), '_test') || config('database.connections.mysql.host') !== '127.0.0.1') {
    throw new RuntimeException('Parent E2E requires isolated loopback *_test database.');
}
$action = $argv[1] ?? '';
$target = DB::table('camera_sources')->where('map_id', $mapId)->where('camera_id', 'demo-camera-01');
if ($action === 'prepare') {
    if ($target->exists()) throw new RuntimeException('Target source must be created through Admin UI.');
    DB::table('cameras')->where('map_id', $mapId)->whereIn('id', ['demo-camera-01', 'demo-camera-04'])->update(['enabled' => true]);
    app(CameraSourceStore::class)->create($mapId, [
        'cameraId' => 'demo-camera-04', 'sourceType' => 'rtsp',
        'sourceUri' => 'rtsp://secondary-user:secondary-password@camera-b.example.invalid/live', 'enabled' => true,
    ]);
    $workflow = app(MapWorkflow::class);
    $etag = $workflow->etag($workflow->map($mapId));
    $actor = User::where('email', $mapId.'@example.invalid')->firstOrFail();
    if (!$workflow->validate($mapId, $etag, $actor)['valid']) throw new RuntimeException('DEMO map validation failed.');
    $workflow->publish($mapId, $etag, $actor);
    if ($target->exists()) throw new RuntimeException('Fixture unexpectedly created target source.');
} elseif ($action === 'created' || $action === 'disabled' || $action === 'enabled') {
    $row = $target->first();
    if (!$row || $row->source_type !== 'rtsp' || (bool) $row->enabled !== ($action !== 'disabled')) throw new RuntimeException('Target source state mismatch.');
    if ($action === 'created') {
        $plaintext = 'rtsp://parent-user:parent-password@camera.example.invalid/live';
        if ($row->source_uri === $plaintext || str_contains($row->source_uri, 'parent-password')) throw new RuntimeException('Source URI was not encrypted.');
        $model = CameraSource::where('map_id', $mapId)->where('camera_id', 'demo-camera-01')->firstOrFail();
        if ($model->source_uri !== $plaintext || str_contains(json_encode($model, JSON_THROW_ON_ERROR), 'source_uri')) throw new RuntimeException('Source encryption or serialization mismatch.');
    }
} elseif ($action === 'metadata') {
    $row = $target->first();
    if (!$row || $row->id !== ($argv[2] ?? null)) throw new RuntimeException('Viewer metadata source identity mismatch.');
    $body = stream_get_contents(STDIN);
    if ($body === false) throw new RuntimeException('Viewer metadata input unavailable.');
    assertCiphertextAbsent($body, $row->source_uri);
} elseif ($action === 'deleted') {
    if ($target->exists()) throw new RuntimeException('Target source remains after Admin deletion.');
} else {
    throw new InvalidArgumentException('Unknown fixture assertion.');
}
echo in_array($action, ['prepare', 'deleted', 'metadata'], true) ? "PASS parent source fixture $action.\n" : "PASS parent source fixture $action: $row->id.\n";
