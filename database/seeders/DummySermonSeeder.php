<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Church;
use App\Models\User;
use App\Models\Sermon;
use App\Models\SermonLink;

class DummySermonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $churchs = Church::where('status',1)->get();
        foreach ($churchs as $church)
        {
            $preacher = User::where([['church_id',$church->id],['usergroup_id',6]])->first();

            factory(Sermon::class,3)->create([
                'church_id' =>  $church->id,
                'user_id'   =>  "25"
            ])->each(function($sermon) use($preacher){
                factory(SermonLink::class,5)->create([
                    'church_id'     =>  $preacher->church_id,
                    'user_id'       =>  $preacher->id,
                    'sermons_id'    =>  $sermon->id
                ]);
            });
        }
    }
}
