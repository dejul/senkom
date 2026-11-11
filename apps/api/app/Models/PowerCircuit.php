<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Relations\MapBelongsToMany;

class PowerCircuit extends DraftEntity
{
    protected $table = 'power_circuits';
    protected $casts = ['status' => 'array'];
    public function cables(): MapBelongsToMany
    {
        $related = $this->newRelatedInstance(Cable::class);
        return (new MapBelongsToMany($related->newQuery(), $this, 'power_circuit_cables', 'circuit_id', 'cable_id', $this->getKeyName(), $related->getKeyName(), 'cables'))
            ->withPivot('map_id', 'sequence')->orderByPivot('sequence');
    }
}
