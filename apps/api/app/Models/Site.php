<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapHasMany;

class Site extends DraftEntity
{
    protected $table = 'sites';
    protected $casts = ['status' => 'array', 'geography' => 'array', 'metadata' => 'array'];
    public function devices(): MapHasMany
    {
        $related = $this->newRelatedInstance(Device::class);
        return new MapHasMany($related->newQuery(), $this, $related->qualifyColumn('site_id'), $this->getKeyName());
    }
}
