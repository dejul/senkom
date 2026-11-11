<?php

declare(strict_types=1);

namespace App\Models;

class MapNode extends DraftEntity
{
    protected $table = 'map_nodes';
    protected $casts = ['x' => 'float', 'y' => 'float', 'z_index' => 'integer', 'metadata' => 'array'];
    public function edges() { return $this->hasMany(MapEdge::class, 'from_node_id')->where('map_id', $this->map_id); }
}
