<?php

declare(strict_types=1);

namespace App\Models\Relations;

use Illuminate\Database\Eloquent\Relations\HasMany;

class MapHasMany extends HasMany
{
    use MapScopedRelation;

    public function addEagerConstraints(array $models)
    {
        parent::addEagerConstraints($models);
        $this->constrainMapPairs($models, $this->localKey, $this->foreignKey);
    }
}
