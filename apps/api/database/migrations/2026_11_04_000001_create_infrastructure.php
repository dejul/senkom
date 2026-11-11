<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function entity(Blueprint $t): void
    {
        $t->string('map_id', 96);
        $t->string('id', 96);
        $t->primary(['map_id', 'id']);
        $t->foreign('map_id')->references('id')->on('maps')->restrictOnDelete();
        $t->timestamps();
    }

    private function ref(Blueprint $t, string $field, string $table): void
    {
        $t->string($field, 96);
        $t->foreign(['map_id', $field])->references(['map_id', 'id'])->on($table)->restrictOnDelete();
    }

    private function code(Blueprint $t): void
    {
        $t->string('code', 96);
        $t->unique(['map_id', 'code']);
    }

    public function up(): void
    {
        Schema::create('users', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('email', 200)->unique();
            $t->string('name', 200);
            $t->string('password');
            $t->json('roles');
            $t->boolean('enabled')->default(true);
            $t->timestamps();
        });
        Schema::create('maps', function (Blueprint $t) {
            $t->string('id', 96)->primary();
            $t->string('name', 200);
            $t->enum('data_origin', ['demo', 'production']);
            $t->string('demo_label', 200)->nullable();
            $t->double('width');
            $t->double('height');
            $t->json('layers');
            $t->unsignedBigInteger('draft_version')->default(1);
            $t->enum('draft_status', ['draft', 'validated'])->default('draft');
            $t->uuid('active_revision_id')->nullable();
            $t->timestamps();
        });
        Schema::create('viewer_tokens', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name', 200);
            $t->char('token_hash', 64)->unique();
            $t->string('map_id', 96);
            $t->foreign('map_id')->references('id')->on('maps')->restrictOnDelete();
            $t->timestamp('expires_at')->index();
            $t->timestamp('revoked_at')->nullable();
            $t->timestamps();
        });
        Schema::create('sites', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $t->string('name', 200);
            $t->string('type', 40)->index();
            $t->text('description')->nullable();
            $t->json('status');
            $t->json('geography')->nullable();
            $t->json('metadata')->nullable();
        });
        Schema::create('devices', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $this->ref($t, 'site_id', 'sites');
            $t->string('type', 40)->index();
            $t->string('model', 200)->nullable();
            $t->json('status');
        });
        Schema::create('device_ports', function (Blueprint $t) {
            $this->entity($t);
            $this->ref($t, 'device_id', 'devices');
            $t->string('name', 200);
            $t->string('type', 40);
            $t->json('status');
            $t->unique(['map_id', 'device_id', 'name']);
        });
        Schema::create('cables', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $t->enum('kind', ['fiber', 'power'])->index();
            $this->ref($t, 'from_site_id', 'sites');
            $this->ref($t, 'to_site_id', 'sites');
            $t->double('length_m');
            $t->json('status');
        });
        Schema::create('fiber_cable_details', function (Blueprint $t) {
            $t->string('map_id', 96);
            $this->ref($t, 'cable_id', 'cables');
            $t->primary(['map_id', 'cable_id']);
            $t->unsignedSmallInteger('total_cores');
            $t->string('fiber_type', 40);
        });
        Schema::create('power_cable_details', function (Blueprint $t) {
            $t->string('map_id', 96);
            $this->ref($t, 'cable_id', 'cables');
            $t->primary(['map_id', 'cable_id']);
            $t->unsignedInteger('conductor_count');
            $t->double('cross_section_mm2');
            $t->double('voltage_v');
        });
        Schema::create('fiber_cores', function (Blueprint $t) {
            $this->entity($t);
            $this->ref($t, 'cable_id', 'cables');
            $t->unsignedSmallInteger('core_number');
            $t->enum('condition', ['usable', 'faulty', 'unknown'])->default('usable');
            $t->unique(['map_id', 'cable_id', 'core_number']);
        });
        Schema::create('fiber_terminations', function (Blueprint $t) {
            $this->entity($t);
            $this->ref($t, 'fiber_core_id', 'fiber_cores');
            $this->ref($t, 'port_id', 'device_ports');
            $t->enum('end_side', ['a', 'b']);
            $t->unique(['map_id', 'fiber_core_id', 'end_side'], 'unique_terminated_end');
        });
        Schema::create('fiber_splices', function (Blueprint $t) {
            $this->entity($t);
            $this->ref($t, 'from_fiber_core_id', 'fiber_cores');
            $this->ref($t, 'to_fiber_core_id', 'fiber_cores');
            $this->ref($t, 'closure_device_id', 'devices');
        });
        Schema::create('logical_links', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $this->ref($t, 'from_port_id', 'device_ports');
            $this->ref($t, 'to_port_id', 'device_ports');
            $t->enum('route_name', ['fo_ring_a', 'fo_ring_b']);
        });
        Schema::create('logical_link_core_segments', function (Blueprint $t) {
            $t->string('map_id', 96);
            $this->ref($t, 'logical_link_id', 'logical_links');
            $this->ref($t, 'fiber_core_id', 'fiber_cores');
            $t->unsignedInteger('sequence');
            $t->primary(['map_id', 'logical_link_id', 'sequence'], 'logical_path_order');
            $t->unique(['map_id', 'fiber_core_id'], 'exclusive_core_allocation');
        });
        Schema::create('power_circuits', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $this->ref($t, 'source_port_id', 'device_ports');
            $this->ref($t, 'destination_port_id', 'device_ports');
            $t->enum('supply_type', ['pln', 'ups', 'backup']);
            $t->json('status');
        });
        Schema::create('power_circuit_cables', function (Blueprint $t) {
            $t->string('map_id', 96);
            $this->ref($t, 'circuit_id', 'power_circuits');
            $this->ref($t, 'cable_id', 'cables');
            $t->unsignedInteger('sequence');
            $t->primary(['map_id', 'circuit_id', 'sequence'], 'power_path_order');
            $t->unique(['map_id', 'circuit_id', 'cable_id'], 'unique_power_segment');
        });
        Schema::create('route_corridors', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $t->string('name', 200);
        });
        Schema::create('corridor_cables', function (Blueprint $t) {
            $t->string('map_id', 96);
            $this->ref($t, 'corridor_id', 'route_corridors');
            $this->ref($t, 'cable_id', 'cables');
            $t->primary(['map_id', 'corridor_id', 'cable_id'], 'corridor_membership');
        });
        Schema::create('cameras', function (Blueprint $t) {
            $this->entity($t);
            $this->code($t);
            $this->ref($t, 'site_id', 'sites');
            $t->string('name', 200);
            $t->boolean('enabled')->default(false);
        });
        Schema::create('map_nodes', function (Blueprint $t) {
            $this->entity($t);
            $t->enum('entity_type', ['site', 'device']);
            $t->string('entity_id', 96);
            $t->index(['map_id', 'entity_type', 'entity_id']);
            $t->double('x');
            $t->double('y');
            $t->string('label', 200)->nullable();
            $t->string('symbol', 40)->nullable();
            $t->integer('z_index')->nullable();
            $t->json('metadata')->nullable();
        });
        Schema::create('map_edges', function (Blueprint $t) {
            $this->entity($t);
            $t->string('connection_type', 40);
            $t->string('connection_id', 96);
            $t->index(['map_id', 'connection_type', 'connection_id']);
            $this->ref($t, 'from_node_id', 'map_nodes');
            $this->ref($t, 'to_node_id', 'map_nodes');
            $t->string('layer', 40)->index();
            $t->json('points');
            $t->string('label', 200)->nullable();
            $t->integer('z_index')->nullable();
            $t->json('metadata')->nullable();
        });
        Schema::create('map_revisions', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('map_id', 96);
            $t->foreign('map_id')->references('id')->on('maps')->restrictOnDelete();
            $t->unique(['map_id', 'id']);
            $t->unsignedBigInteger('draft_version');
            $t->uuid('published_by');
            $t->foreign('published_by')->references('id')->on('users')->restrictOnDelete();
            $t->timestamp('published_at')->index();
            $t->longText('snapshot');
            $t->char('checksum', 64);
        });
        Schema::table('maps', function (Blueprint $t) {
            $t->foreign(['id', 'active_revision_id'])->references(['map_id', 'id'])->on('map_revisions')->restrictOnDelete();
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->uuid('actor_id')->nullable();
            $t->foreign('actor_id')->references('id')->on('users')->restrictOnDelete();
            $t->string('map_id', 96)->nullable();
            $t->foreign('map_id')->references('id')->on('maps')->restrictOnDelete();
            $t->string('action', 80);
            $t->json('details');
            $t->timestamp('created_at')->index();
            $t->index(['map_id', 'id']);
        });
        foreach (['map_revisions', 'audit_logs'] as $table) {
            foreach (['UPDATE', 'DELETE'] as $operation) {
                DB::unprepared("CREATE TRIGGER {$table}_no_".strtolower($operation)." BEFORE {$operation} ON {$table} FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Immutable record'");
            }
        }
    }

    public function down(): void
    {
        Schema::table('maps', fn (Blueprint $t) => $t->dropForeign(['id', 'active_revision_id']));
        foreach (['audit_logs', 'map_revisions', 'map_edges', 'map_nodes', 'cameras', 'corridor_cables', 'route_corridors', 'power_circuit_cables', 'power_circuits', 'logical_link_core_segments', 'logical_links', 'fiber_splices', 'fiber_terminations', 'fiber_cores', 'power_cable_details', 'fiber_cable_details', 'cables', 'device_ports', 'devices', 'sites', 'viewer_tokens', 'maps', 'users'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
