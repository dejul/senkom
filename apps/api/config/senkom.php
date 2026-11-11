<?php

return [
    'enabled' => (bool) env('SENKOM_INFRASTRUCTURE_ENABLED', false),
    'map_id' => env('SENKOM_MAP_ID', 'main'),
    'max_body_bytes' => 4 * 1024 * 1024,
];
