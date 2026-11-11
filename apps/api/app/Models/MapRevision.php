<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MapRevision extends Model
{
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['published_at' => 'immutable_datetime', 'draft_version' => 'integer'];
    public function map() { return $this->belongsTo(InfrastructureMap::class, 'map_id'); }
    public function publisher() { return $this->belongsTo(User::class, 'published_by'); }
}
