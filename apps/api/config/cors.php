<?php

return [
    'paths' => ['api/v1/auth/*', 'api/v1/admin/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('SENKOM_ADMIN_ORIGINS', ''))), fn ($origin) => $origin !== '' && !str_contains($origin, '*'))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'X-CSRF-TOKEN', 'If-Match'],
    'exposed_headers' => ['ETag'],
    'max_age' => 0,
    'supports_credentials' => true,
];
