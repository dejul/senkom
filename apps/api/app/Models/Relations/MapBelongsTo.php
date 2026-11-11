<?php

declare(strict_types=1);

namespace App\Models\Relations;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MapBelongsTo extends BelongsTo
{
    use MapScopedRelation;

    public function addEagerConstraints(array $models)
    {
        parent::addEagerConstraints($models);
        $this->constrainMapPairs($models, $this->foreignKey, $this->getQualifiedOwnerKeyName());
    }
}
