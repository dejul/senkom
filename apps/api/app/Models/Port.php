<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsTo;

class Port extends DraftEntity
{
    protected $table = 'device_ports';
    protected $casts = ['status' => 'array'];
    public function device(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Device::class);
        return new MapBelongsTo($related->newQuery(), $this, 'device_id', $related->getKeyName(), 'device');
    }
}
