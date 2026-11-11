<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\{MapBelongsTo, MapHasMany};

class Device extends DraftEntity
{
    protected $table = 'devices';
    protected $casts = ['status' => 'array'];
    public function site(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Site::class);
        return new MapBelongsTo($related->newQuery(), $this, 'site_id', $related->getKeyName(), 'site');
    }

    public function ports(): MapHasMany
    {
        $related = $this->newRelatedInstance(Port::class);
        return new MapHasMany($related->newQuery(), $this, $related->qualifyColumn('device_id'), $this->getKeyName());
    }
}
