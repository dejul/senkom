<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\{MapBelongsTo, MapHasMany};

class FiberCore extends DraftEntity
{
    protected $table = 'fiber_cores';
    protected $casts = ['core_number' => 'integer'];
    public function cable(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Cable::class);
        return new MapBelongsTo($related->newQuery(), $this, 'cable_id', $related->getKeyName(), 'cable');
    }
    public function terminations(): MapHasMany
    {
        $related = $this->newRelatedInstance(FiberTermination::class);
        return new MapHasMany($related->newQuery(), $this, $related->qualifyColumn('fiber_core_id'), $this->getKeyName());
    }
}
