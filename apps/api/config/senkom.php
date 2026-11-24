<?php

return [
    'enabled' => (bool) env('SENKOM_INFRASTRUCTURE_ENABLED', false),
    'map_id' => env('SENKOM_MAP_ID', 'main'),
    'max_body_bytes' => 4 * 1024 * 1024,
    'playback' => [
        'ttl_seconds' => (int) env('SENKOM_PLAYBACK_TTL_SECONDS', 60),
        'issuer' => 'senkom',
        'audience' => 'mediamtx-gateway',
        'paths' => json_decode((string) env('SENKOM_PLAYBACK_PATHS', '{}'), true) ?: [],
        'hls_origin' => env('SENKOM_GATEWAY_HLS_ORIGIN', 'http://127.0.0.1:8888'),
        'webrtc_origin' => env('SENKOM_GATEWAY_WEBRTC_ORIGIN', 'http://127.0.0.1:8889'),
        'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('SENKOM_PLAYBACK_ALLOWED_ORIGINS', 'http://127.0.0.1:8000,senkom://app'))))),
        'publisher_user' => 'senkom-publisher',
        'publisher_password' => env('SENKOM_GATEWAY_PUBLISH_PASSWORD', ''),
    ],
];
