<?php

declare(strict_types=1);

namespace App\Models;

class MapEdge extends DraftEntity
{
    protected $table = 'map_edges';
    protected $casts = ['points' => 'array', 'z_index' => 'integer', 'metadata' => 'array'];
    public function fromNode() { return $this->belongsTo(MapNode::class, 'from_node_id')->where('map_id', $this->map_id); }
    public function toNode() { return $this->belongsTo(MapNode::class, 'to_node_id')->where('map_id', $this->map_id); }
}
