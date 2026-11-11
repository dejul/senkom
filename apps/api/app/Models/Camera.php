<?php

declare(strict_types=1);

namespace App\Models;

class Camera extends DraftEntity
{
    protected $table = 'cameras';
    protected $casts = ['enabled' => 'boolean'];
    public function site() { return $this->belongsTo(Site::class, 'site_id')->where('map_id', $this->map_id); }
}
