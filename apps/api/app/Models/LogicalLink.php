<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsToMany;

class LogicalLink extends DraftEntity
{
    protected $table = 'logical_links';
    public function cores(): MapBelongsToMany
    {
        $related = $this->newRelatedInstance(FiberCore::class);
        return (new MapBelongsToMany($related->newQuery(), $this, 'logical_link_core_segments', 'logical_link_id', 'fiber_core_id', $this->getKeyName(), $related->getKeyName(), 'cores'))
            ->withPivot('map_id', 'sequence')->orderByPivot('sequence');
    }
}
