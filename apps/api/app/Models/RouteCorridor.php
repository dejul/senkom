<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsToMany;

class RouteCorridor extends DraftEntity
{
    protected $table = 'route_corridors';
    protected $casts = [];
    public function cables(): MapBelongsToMany
    {
        $related = $this->newRelatedInstance(Cable::class);
        return (new MapBelongsToMany($related->newQuery(), $this, 'corridor_cables', 'corridor_id', 'cable_id', $this->getKeyName(), $related->getKeyName(), 'cables'))
            ->withPivot('map_id');
    }
}
