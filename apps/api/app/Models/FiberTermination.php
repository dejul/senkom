<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsTo;

class FiberTermination extends DraftEntity
{
    protected $table = 'fiber_terminations';
    public function core(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(FiberCore::class);
        return new MapBelongsTo($related->newQuery(), $this, 'fiber_core_id', $related->getKeyName(), 'core');
    }

    public function port(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Port::class);
        return new MapBelongsTo($related->newQuery(), $this, 'port_id', $related->getKeyName(), 'port');
    }
}
