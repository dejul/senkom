<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, MapController};
use App\Http\Middleware\{AdminAccess, InfrastructureAccess, ViewerAccess};
use App\Services\InventoryStore;

Route::get('/health', fn () => response()->json([
    'data' => ['status' => 'ok', 'phase' => 0],
    'meta' => ['apiVersion' => '1', 'schemaVersion' => 1],
]));

if (!config('senkom.enabled')) return;

Route::middleware([InfrastructureAccess::class.':admin', 'web'])->group(function () {
    Route::get('/auth/session', [AuthController::class, 'session']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware(AdminAccess::class.':authenticated');
    Route::prefix('admin')->middleware(AdminAccess::class)->group(function () {
        Route::get('/map/draft', [MapController::class, 'draft']);
        Route::put('/map/draft', [MapController::class, 'save'])->middleware(AdminAccess::class.':infrastructure_editor');
        Route::post('/map/validate', [MapController::class, 'validateDraft'])->middleware(AdminAccess::class.':validate');
        Route::post('/map/publish', [MapController::class, 'publish'])->middleware(AdminAccess::class.':publisher');
        Route::post('/map/rollback', [MapController::class, 'rollback'])->middleware(AdminAccess::class.':publisher');
        Route::get('/map-revisions', [MapController::class, 'revisions']);
        Route::get('/map-revisions/{id}', [MapController::class, 'revision']);
        Route::get('/audit-logs', [MapController::class, 'audit'])->middleware(AdminAccess::class.':publisher');
        Route::get('/map-layouts', [MapController::class, 'layout']);
        Route::put('/map-layouts', [MapController::class, 'layout'])->middleware(AdminAccess::class.':infrastructure_editor');
        $resources = implode('|', array_keys(InventoryStore::RESOURCES));
        Route::get('/{resource}', [MapController::class, 'index'])->where('resource', $resources);
        Route::get('/{resource}/{id}', [MapController::class, 'show'])->where('resource', $resources);
        Route::post('/{resource}', [MapController::class, 'mutate'])->where('resource', $resources)->middleware(AdminAccess::class.':infrastructure_editor');
        Route::match(['PUT', 'PATCH', 'DELETE'], '/{resource}/{id}', [MapController::class, 'mutate'])->where('resource', $resources)->middleware(AdminAccess::class.':infrastructure_editor');
    });
});
Route::prefix('viewer')->middleware([InfrastructureAccess::class.':viewer', ViewerAccess::class])->group(function () {
    Route::get('/map', [MapController::class, 'viewer']);
    Route::get('/{resource}', [MapController::class, 'viewer'])->where('resource', 'cameras');
    Route::get('/{resource}/{id}', [MapController::class, 'viewer'])->where('resource', 'sites|cables');
    Route::match(['POST', 'PUT', 'PATCH', 'DELETE'], '/{path}', fn () => abort(403))->where('path', '.*');
});
