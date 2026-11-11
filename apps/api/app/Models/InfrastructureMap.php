<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InfrastructureMap extends Model
{
    protected $table = 'maps';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['layers' => 'array', 'draft_version' => 'integer', 'width' => 'float', 'height' => 'float'];

    public function sites() { return $this->hasMany(Site::class, 'map_id'); }
    public function revisions() { return $this->hasMany(MapRevision::class, 'map_id'); }
    public function activeRevision() { return $this->belongsTo(MapRevision::class, 'active_revision_id'); }
}
