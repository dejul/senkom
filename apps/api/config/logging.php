<?php

return [
    'default' => env('LOG_CHANNEL', 'daily'),
    'channels' => [
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/senkom.log'),
            'level' => env('LOG_LEVEL', 'info'),
            'days' => 14,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
        ],
    ],
];
