<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_map_roles', function (Blueprint $t) {
            $t->uuid('user_id');
            $t->string('map_id', 96);
            $t->enum('role', ['infrastructure_editor', 'publisher']);
            $t->primary(['user_id', 'map_id', 'role']);
            $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $t->foreign('map_id')->references('id')->on('maps')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_map_roles');
    }
};
