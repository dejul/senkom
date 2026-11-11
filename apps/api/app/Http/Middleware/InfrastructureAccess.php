<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\MapWorkflow;
use Closure;
use Illuminate\Http\Request;

final class InfrastructureAccess
{
    public function handle(Request $request, Closure $next, string $kind = 'admin')
    {
        abort_unless(config('senkom.enabled'), 404);
        $loopback = in_array($request->getHost(), ['localhost', '127.0.0.1', '::1'], true) && in_array($request->ip(), ['127.0.0.1', '::1'], true);
        if (!$request->isSecure() && !(app()->environment(['local', 'testing']) && $loopback)) MapWorkflow::fail(400, 'HTTPS_REQUIRED', 'Gunakan HTTPS.');
        if (strlen($request->getContent()) > config('senkom.max_body_bytes')) MapWorkflow::fail(413, 'PAYLOAD_TOO_LARGE', 'Payload melebihi batas.');
        if (!in_array($request->method(), ['GET', 'HEAD'], true) && $request->getContent() !== '') {
            if (!$request->isJson()) MapWorkflow::fail(415, 'JSON_REQUIRED', 'Gunakan application/json.');
            try {
                $body = json_decode($request->getContent(), false, 64, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                MapWorkflow::fail(400, 'INVALID_JSON', 'JSON tidak valid.');
            }
            if (!is_object($body) && $body !== []) MapWorkflow::fail(422, 'OBJECT_REQUIRED', 'Body harus berupa object JSON.');
        }
        if ($kind === 'admin' && $request->headers->has('Authorization')) MapWorkflow::fail(403, 'VIEWER_READ_ONLY', 'Bearer viewer tidak mempunyai akses admin.');
        $response = $next($request);
        $response->headers->set('Cache-Control', 'private, no-store');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        return $response;
    }
}
