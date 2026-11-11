<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Middleware\AdminCsrf;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php', apiPrefix: 'api/v1', commands: __DIR__.'/../routes/console.php')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(replace: [PreventRequestForgery::class => AdminCsrf::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $exception): bool => true);
        $exceptions->report(function (Throwable $exception): void {
            Log::error('request_failed', ['exception_type' => $exception::class]);
        })->stop();
        $exceptions->render(function (Throwable $exception, Request $request) {
            if ($exception instanceof \Illuminate\Http\Exceptions\HttpResponseException) return $exception->getResponse();
            if ($exception instanceof ValidationException) return response()->json(['error' => ['code' => 'INPUT', 'message' => 'Input tidak valid: '.implode(', ', array_keys($exception->errors())).'.']], 422);
            if ($exception instanceof QueryException && in_array((string) $exception->getCode(), ['23000', '45000'], true)) return response()->json(['error' => ['code' => 'INTEGRITY', 'message' => 'Perubahan melanggar integritas atau immutability data.']], 422);
            $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
            return response()->json(['error' => [
                'code' => 'HTTP_'.$status,
                'message' => $status === 404 ? 'Resource not found.' : 'Request could not be completed.',
            ]], $status, $exception instanceof HttpExceptionInterface ? $exception->getHeaders() : []);
        });
    })->create();
