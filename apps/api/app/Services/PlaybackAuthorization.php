<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\{Camera, CameraSource, InfrastructureMap};
use Illuminate\Support\Facades\{Crypt, DB};

final class PlaybackAuthorization
{
    public function issue(string $viewerToken, string $mapId, string $cameraId, string $protocol): array
    {
        $tokenHash = hash('sha256', $viewerToken);
        $viewer = DB::table('viewer_tokens')->where('token_hash', $tokenHash)->where('map_id', $mapId)->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        if (!$viewer || !$this->eligibleCamera($mapId, $cameraId)) abort(404);

        $path = $this->path($mapId, $cameraId);
        if (!in_array($protocol, ['hls', 'webrtc'], true)) abort(422);
        if (!$path) abort(503);
        $ttl = config('senkom.playback.ttl_seconds');
        if (!is_int($ttl) || $ttl < 15 || $ttl > 300) abort(503);

        $now = now()->timestamp;
        $expiresAt = now()->addSeconds($ttl);
        $claims = [
            'iss' => config('senkom.playback.issuer'),
            'aud' => config('senkom.playback.audience'),
            'sub' => $tokenHash,
            'map' => $mapId,
            'camera' => $cameraId,
            'path' => $path,
            'action' => 'read',
            'protocol' => $protocol,
            'iat' => $now,
            'exp' => $expiresAt->timestamp,
        ];
        $accessToken = Crypt::encryptString(json_encode($claims, JSON_THROW_ON_ERROR));
        $origin = $this->origin($protocol);
        $endpointPath = $protocol === 'hls' ? '/index.m3u8' : '/whep';

        return [
            'sessionId' => substr(hash('sha256', $accessToken), 0, 24),
            'mapId' => $mapId,
            'cameraId' => $cameraId,
            'protocol' => $protocol,
            'endpoint' => $origin.'/'.$path.$endpointPath,
            'authScheme' => 'Basic',
            'authUsername' => 'senkom-viewer',
            'accessToken' => $accessToken,
            'issuedAt' => now()->setTimestamp($now)->toISOString(),
            'expiresAt' => $expiresAt->toISOString(),
            'expiresInSeconds' => $ttl,
        ];
    }

    public function authorizeGateway(mixed $input): bool
    {
        if (!is_array($input)) return false;
        if ($this->authorizePublisher($input)) return true;
        if (($input['user'] ?? null) !== 'senkom-viewer' || ($input['action'] ?? null) !== 'read') return false;

        $token = $input['password'] ?? null;
        if (!is_string($token) || $token === '' || strlen($token) > 4096) return false;
        try {
            $claims = json_decode(Crypt::decryptString($token), true, 8, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return false;
        }
        if (!is_array($claims)
            || ($claims['iss'] ?? null) !== config('senkom.playback.issuer')
            || ($claims['aud'] ?? null) !== config('senkom.playback.audience')
            || ($claims['action'] ?? null) !== 'read'
            || !is_int($claims['exp'] ?? null)
            || $claims['exp'] <= now()->timestamp
            || !is_int($claims['iat'] ?? null)
            || $claims['iat'] > now()->timestamp
            || !is_string($claims['sub'] ?? null)
            || !preg_match('/\A[a-f0-9]{64}\z/', $claims['sub'])
            || !is_string($claims['map'] ?? null)
            || !is_string($claims['camera'] ?? null)
            || !is_string($claims['path'] ?? null)
            || !is_string($claims['protocol'] ?? null)) return false;

        $requestProtocol = $input['protocol'] ?? null;
        $requestPath = $input['path'] ?? null;
        if (!in_array($requestProtocol, ['hls', 'webrtc'], true)
            || $claims['protocol'] !== $requestProtocol
            || $claims['path'] !== $requestPath
            || $claims['path'] !== $this->path($claims['map'], $claims['camera'])) return false;

        $viewer = DB::table('viewer_tokens')->where('token_hash', $claims['sub'])->where('map_id', $claims['map'])->whereNull('revoked_at')->where('expires_at', '>', now())->exists();
        return $viewer && $this->eligibleCamera($claims['map'], $claims['camera']);
    }

    private function authorizePublisher(array $input): bool
    {
        $password = config('senkom.playback.publisher_password');
        return is_string($password) && $password !== ''
            && ($input['user'] ?? null) === config('senkom.playback.publisher_user')
            && is_string($input['password'] ?? null)
            && hash_equals($password, $input['password'])
            && ($input['action'] ?? null) === 'publish'
            && ($input['protocol'] ?? null) === 'rtsp'
            && in_array($input['path'] ?? null, ['lab', 'lab-b'], true);
    }

    private function eligibleCamera(string $mapId, string $cameraId): bool
    {
        if (!preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $mapId)
            || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $cameraId)) return false;

        $map = InfrastructureMap::with('activeRevision')->whereKey($mapId)->first();
        $revision = $map?->activeRevision;
        if (!$revision || $revision->map_id !== $mapId || !hash_equals($revision->checksum, hash('sha256', $revision->snapshot))) return false;
        try {
            $snapshot = json_decode($revision->snapshot, true, 64, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return false;
        }
        if (!is_array($snapshot) || ($snapshot['mapId'] ?? null) !== $mapId || !(app(MapRules::class)->schemaValid($snapshot, 'published-map.v2.json'))) return false;
        $published = collect($snapshot['cameras'] ?? [])->first(fn ($camera) => ($camera['id'] ?? null) === $cameraId && ($camera['enabled'] ?? false) === true);
        if (!$published || !Camera::where('map_id', $mapId)->whereKey($cameraId)->exists()) return false;
        return CameraSource::where('map_id', $mapId)->where('camera_id', $cameraId)->where('enabled', true)->exists();
    }

    private function path(string $mapId, string $cameraId): ?string
    {
        $paths = config('senkom.playback.paths', []);
        $path = is_array($paths) ? ($paths[$mapId][$cameraId] ?? null) : null;
        return is_string($path) && preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}\z/', $path) ? $path : null;
    }

    private function origin(string $protocol): string
    {
        $origin = config('senkom.playback.'.$protocol.'_origin');
        $parts = is_string($origin) ? parse_url($origin) : false;
        if (!is_array($parts) || !in_array($parts['scheme'] ?? null, ['http', 'https'], true)
            || !isset($parts['host']) || isset($parts['user']) || isset($parts['pass'])
            || isset($parts['query']) || isset($parts['fragment'])
            || (isset($parts['path']) && $parts['path'] !== '' && $parts['path'] !== '/')) abort(503);
        if (app()->environment('production') && $parts['scheme'] !== 'https') abort(503);
        return rtrim($origin, '/');
    }
}
