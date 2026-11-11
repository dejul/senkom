<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class DraftEntity extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    protected function setKeysForSaveQuery($query)
    {
        return parent::setKeysForSaveQuery($query)->where('map_id', $this->getOriginal('map_id', $this->map_id));
    }

    public function map() { return $this->belongsTo(InfrastructureMap::class, 'map_id'); }
}
