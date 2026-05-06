<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Church;

class DummyBulletinsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $churches = Church::where('status', 1)->get();

        foreach ($churches as $church) {
            factory(\App\Models\Bulletin::class, 6)->create([
                'church_id' => $church->id,
            ]);
        }
    }
}
