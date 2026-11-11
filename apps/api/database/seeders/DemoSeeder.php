<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\InfrastructureMap;
use App\Services\{InventoryStore, MapRules, MapWorkflow};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

final class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) throw new \RuntimeException('DEMO seeding is restricted to local/testing.');
        DB::transaction(function () {
            $id = config('senkom.map_id');
            if (InfrastructureMap::find($id)) throw new \RuntimeException('Map already exists; seed will not overwrite it.');
            $content = json_decode(file_get_contents(base_path('../../tests/fixtures/demo-map.v1.json')), true, 64, JSON_THROW_ON_ERROR);
            unset($content['revision'], $content['publishedAt'], $content['status']);
            $content['schemaVersion'] = 2;
            $rules = new MapRules();
            if ($rules->inspect($content, true)) throw new \RuntimeException('Invalid DEMO fixture.');
            $map = InfrastructureMap::create(['id' => $id, 'name' => 'DEMO Infrastructure', 'data_origin' => 'demo', 'demo_label' => $content['demoLabel'], 'width' => $content['layout']['width'], 'height' => $content['layout']['height'], 'layers' => $content['layers']]);
            app(InventoryStore::class)->replace($map, $content);
            app(MapWorkflow::class)->audit(null, $id, 'map.seed_demo', ['source' => 'Phase 0 synthetic fixture']);
        });
    }
}
