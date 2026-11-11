<?php

declare(strict_types=1);

namespace App\Models\Relations;

use Illuminate\Database\Eloquent\{Builder, Collection};

// ponytail: map_id + one native key for inventory reads; broader composite ORM support needs a separate audit.
trait MapScopedRelation
{
    public function addConstraints()
    {
        parent::addConstraints();
        if (static::$constraints) {
            $this->query->where($this->related->qualifyColumn('map_id'), $this->parent->getAttribute('map_id'));
        }
    }

    protected function constrainMapPairs(array $models, string $parentKey, string $relatedKey): void
    {
        $groups = [];
        foreach ($models as $model) {
            $map = $model->getAttribute('map_id');
            $key = $model->getAttribute($parentKey);
            if ($map !== null && $key !== null) $groups[$map][] = $key;
        }
        if ($groups === []) {
            $this->query->whereRaw('0 = 1');
            return;
        }
        $mapColumn = $this->related->qualifyColumn('map_id');
        $this->query->where(function (Builder $query) use ($groups, $mapColumn, $relatedKey) {
            foreach ($groups as $map => $keys) {
                $query->orWhere(fn (Builder $group) => $group->where($mapColumn, (string) $map)->whereIn($relatedKey, array_values(array_unique($keys))));
            }
        });
    }

    public function match(array $models, Collection $results, $relation)
    {
        // Native matching uses only id; separate maps before building its dictionaries.
        $byMap = $results->groupBy('map_id');
        foreach ((new Collection($models))->groupBy('map_id') as $map => $parents) {
            parent::match($parents->all(), $byMap->get($map, $this->related->newCollection()), $relation);
        }
        return $models;
    }

    public function getRelationExistenceQuery(Builder $query, Builder $parentQuery, $columns = ['*'])
    {
        return parent::getRelationExistenceQuery($query, $parentQuery, $columns)
            ->whereColumn($query->qualifyColumn('map_id'), $parentQuery->qualifyColumn('map_id'));
    }
}
