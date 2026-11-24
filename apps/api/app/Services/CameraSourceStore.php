<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\{Camera, CameraSource};
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class CameraSourceStore
{
    private const FIELDS = ['sourceType', 'sourceUri', 'enabled'];

    public function create(string $mapId, array $input): CameraSource
    {
        foreach (array_keys($input) as $key) {
            if (!in_array($key, ['cameraId', ...self::FIELDS], true)) {
                throw ValidationException::withMessages([$key => 'Field is not allowed.']);
            }
        }
        $cameraId = $this->cameraId($input);
        $this->assertCamera($mapId, $cameraId);
        if (CameraSource::where('map_id', $mapId)->where('camera_id', $cameraId)->exists()) {
            throw ValidationException::withMessages(['cameraId' => 'Camera source already exists.']);
        }

        $validated = $this->validate($input, true);

        $source = (new CameraSource())->forceFill([
            'map_id' => $mapId,
            'id' => (string) Str::uuid(),
            'camera_id' => $cameraId,
            'source_type' => $validated['sourceType'],
            'source_uri' => $validated['sourceUri'],
            'enabled' => $validated['enabled'] ?? false,
        ]);
        $source->save();

        return $source;
    }

    public function find(string $mapId, string $id): ?CameraSource
    {
        return CameraSource::where('map_id', $mapId)->whereKey($id)->first();
    }

    public function findForCamera(string $mapId, string $cameraId): ?CameraSource
    {
        return CameraSource::where('map_id', $mapId)->where('camera_id', $cameraId)->first();
    }

    public function updateForCamera(string $mapId, string $cameraId, array $input): ?CameraSource
    {
        $source = $this->findForCamera($mapId, $cameraId);
        if (!$source) return null;

        foreach (array_keys($input) as $key) {
            if (!in_array($key, self::FIELDS, true)) {
                throw ValidationException::withMessages([$key => 'Field is not allowed.']);
            }
        }
        $validated = $this->validate($input, false);
        if (array_key_exists('sourceType', $validated)) $source->source_type = $validated['sourceType'];
        if (array_key_exists('sourceUri', $validated)) $source->source_uri = $validated['sourceUri'];
        if (array_key_exists('enabled', $validated)) $source->enabled = $validated['enabled'];
        $source->save();

        return $source->refresh();
    }

    public function disableForCamera(string $mapId, string $cameraId): bool
    {
        $query = CameraSource::where('map_id', $mapId)->where('camera_id', $cameraId);
        if (!$query->exists()) return false;
        $query->update(['enabled' => false, 'updated_at' => now()]);

        return true;
    }

    public function deleteForCamera(string $mapId, string $cameraId): bool
    {
        return CameraSource::where('map_id', $mapId)->where('camera_id', $cameraId)->delete() === 1;
    }

    private function cameraId(array $input): string
    {
        if (!isset($input['cameraId']) || !is_string($input['cameraId']) || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/', $input['cameraId'])) {
            throw ValidationException::withMessages(['cameraId' => 'Camera is unavailable.']);
        }

        return $input['cameraId'];
    }

    private function assertCamera(string $mapId, string $cameraId): void
    {
        if (!Camera::where('map_id', $mapId)->whereKey($cameraId)->exists()) {
            throw ValidationException::withMessages(['cameraId' => 'Camera is unavailable.']);
        }
    }

    private function validate(array $input, bool $required): array
    {
        $rules = [
            'sourceType' => [$required ? 'required' : 'sometimes', 'string', 'in:rtsp'],
            'sourceUri' => [$required ? 'required' : 'sometimes', 'string', 'max:4096', function (string $attribute, mixed $value, \Closure $fail): void {
                if (!$this->validRtspUri($value)) $fail('Source URI is invalid.');
            }],
            'enabled' => ['sometimes', 'boolean'],
        ];
        $validator = Validator::make($input, $rules, [
            'sourceType.required' => 'Source type is required.',
            'sourceType.string' => 'Source type is invalid.',
            'sourceType.in' => 'Source type is invalid.',
            'sourceUri.required' => 'Source URI is required.',
            'sourceUri.string' => 'Source URI is invalid.',
            'sourceUri.max' => 'Source URI is invalid.',
            'enabled.boolean' => 'Enabled state is invalid.',
        ]);
        $validator->validate();

        return $validator->validated();
    }

    private function validRtspUri(mixed $value): bool
    {
        if (!is_string($value) || $value === '' || preg_match('/[\x00-\x20\x7f\\\\]/', $value) || str_contains($value, '#') || preg_match('/%(?![A-Fa-f0-9]{2})|%(?:0[0-9a-f]|1[0-9a-f]|7f)/i', $value)) {
            return false;
        }
        $parts = parse_url($value);
        if (!is_array($parts) || !in_array(strtolower($parts['scheme'] ?? ''), ['rtsp', 'rtsps'], true)) return false;
        if (!isset($parts['host']) || $parts['host'] === '' || (isset($parts['user']) && $parts['user'] === '')) return false;
        if (isset($parts['port']) && ($parts['port'] < 1 || $parts['port'] > 65535)) return false;

        $host = trim($parts['host'], '[]');
        if (filter_var($host, FILTER_VALIDATE_IP)) return true;

        return strlen($host) <= 253 && filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME) !== false;
    }
}
