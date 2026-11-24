<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camera_sources', function (Blueprint $table) {
            $table->string('map_id', 96);
            $table->string('id', 96);
            $table->string('camera_id', 96);
            $table->string('source_type', 16);
            $table->longText('source_uri');
            $table->boolean('enabled')->default(false);
            $table->timestamps();
            $table->primary(['map_id', 'id']);
            // ponytail: one source per camera; multi-stream support needs an explicit source role and wider unique key.
            $table->unique(['map_id', 'camera_id']);
            $table->foreign('map_id')->references('id')->on('maps')->restrictOnDelete();
            $table->foreign(['map_id', 'camera_id'])->references(['map_id', 'id'])->on('cameras')->cascadeOnDelete();
            $table->index(['map_id', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camera_sources');
    }
};
