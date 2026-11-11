<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;

final class AdminCsrf extends PreventRequestForgery
{
    protected function runningUnitTests() { return false; }
    protected function hasValidOrigin($request) { return false; }
}
