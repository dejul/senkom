<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\{MapBelongsTo, MapHasMany};

class Cable extends DraftEntity
{
    protected $table = 'cables';
    protected $casts = ['status' => 'array', 'length_m' => 'float'];
    public function cores(): MapHasMany
    {
        $related = $this->newRelatedInstance(FiberCore::class);
        return new MapHasMany($related->newQuery(), $this, $related->qualifyColumn('cable_id'), $this->getKeyName());
    }

    public function fromSite(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Site::class);
        return new MapBelongsTo($related->newQuery(), $this, 'from_site_id', $related->getKeyName(), 'fromSite');
    }

    public function toSite(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Site::class);
        return new MapBelongsTo($related->newQuery(), $this, 'to_site_id', $related->getKeyName(), 'toSite');
    }
}
