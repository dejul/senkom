<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $hidden = ['password'];
    protected $casts = ['roles' => 'array', 'enabled' => 'boolean', 'password' => 'hashed'];

    public function permits(string $role, ?string $mapId = null): bool
    {
        if (!$this->enabled) return false;
        if (in_array('system_admin', $this->roles, true)) return true;
        if (!in_array($role, $this->roles, true)) return false;
        $query = DB::table('user_map_roles')->where('user_id', $this->id)->where('role', $role);
        if ($mapId !== null) $query->where('map_id', $mapId);
        return $query->exists();
    }
}
