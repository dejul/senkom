<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsTo;

class CameraSource extends DraftEntity
{
    protected $table = 'camera_sources';

    protected $guarded = ['*'];

    protected $hidden = ['source_uri'];

    protected $casts = [
        'source_uri' => 'encrypted',
        'enabled' => 'boolean',
    ];

    public function camera(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Camera::class);

        return new MapBelongsTo($related->newQuery(), $this, 'camera_id', $related->getKeyName(), 'camera');
    }
}
