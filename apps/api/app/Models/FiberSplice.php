<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsTo;

class FiberSplice extends DraftEntity
{
    protected $table = 'fiber_splices';
    public function fromCore(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(FiberCore::class);
        return new MapBelongsTo($related->newQuery(), $this, 'from_fiber_core_id', $related->getKeyName(), 'fromCore');
    }

    public function toCore(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(FiberCore::class);
        return new MapBelongsTo($related->newQuery(), $this, 'to_fiber_core_id', $related->getKeyName(), 'toCore');
    }

    public function closure(): MapBelongsTo
    {
        $related = $this->newRelatedInstance(Device::class);
        return new MapBelongsTo($related->newQuery(), $this, 'closure_device_id', $related->getKeyName(), 'closure');
    }
}
