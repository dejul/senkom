<?php

declare(strict_types=1);

namespace App\Models\Relations;

use Illuminate\Database\Eloquent\{Builder, Collection};
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

// ponytail: scope map_id on pivot and related rows; audit other composite pivots before reuse.
class MapBelongsToMany extends BelongsToMany
{
    public function addConstraints()
    {
        parent::addConstraints();
        $this->query->whereColumn($this->related->qualifyColumn('map_id'), $this->table.'.map_id');
        if (static::$constraints) $this->query->where($this->table.'.map_id', $this->parent->map_id);
    }

    public function addEagerConstraints(array $models)
    {
        parent::addEagerConstraints($models);
        $groups = [];
        foreach ($models as $model) $groups[$model->map_id][] = $model->getKey();
        $this->query->where(function (Builder $query) use ($groups) {
            foreach ($groups as $map => $ids) {
                $query->orWhere(fn (Builder $pair) => $pair->where($this->table.'.map_id', $map)
                    ->whereIn($this->getQualifiedForeignPivotKeyName(), array_unique($ids)));
            }
        });
    }

    public function match(array $models, Collection $results, $relation)
    {
        $byMap = $results->groupBy(fn ($core) => $core->pivot->map_id);
        foreach ((new Collection($models))->groupBy('map_id') as $map => $parents) {
            parent::match($parents->all(), $byMap->get($map, $this->related->newCollection()), $relation);
        }
        return $models;
    }

    public function getRelationExistenceQuery(Builder $query, Builder $parentQuery, $columns = ['*'])
    {
        return parent::getRelationExistenceQuery($query, $parentQuery, $columns)
            ->whereColumn($this->table.'.map_id', $parentQuery->qualifyColumn('map_id'))
            ->whereColumn($query->qualifyColumn('map_id'), $this->table.'.map_id');
    }
}
