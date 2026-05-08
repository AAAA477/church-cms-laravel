<?php
namespace Database\Seeders;

use App\Models\Church;
use App\Models\Role;
use App\Models\User;
use App\Models\Userprofile;
use Illuminate\Database\Seeder;

class DummyChurchSeeder extends Seeder
{
    public function run()
    {
        $church = Church::where('status', 1)->first();

        if (! $church) {
            $this->command->error('No active church found. Run `php artisan church:setup` first.');
            return;
        }

        $subadminRole = Role::where('name', 'church-subadmin')->first();
        $staffRole    = Role::where('name', 'staff')->first();

        // 1 Sub-admin
        factory(User::class, 1)->create([
            'email'        => 'subadmin@demo.churchcms.app',
            'church_id'    => $church->id,
            'usergroup_id' => 4,
        ])->each(function ($user) use ($subadminRole) {
            factory(Userprofile::class, 1)->create([
                'user_id'         => $user->id,
                'church_id'       => $user->church_id,
                'membership_type' => 'member',
            ]);
            if ($subadminRole) {
                $user->attachRole($subadminRole);
            }
        });

        // 6 Staff
        factory(User::class, 6)->create([
            'church_id'    => $church->id,
            'usergroup_id' => 4,
        ])->each(function ($staff) use ($staffRole) {
            factory(Userprofile::class, 1)->create([
                'user_id'         => $staff->id,
                'church_id'       => $staff->church_id,
                'membership_type' => 'member',
            ]);
            if ($staffRole) {
                $staff->attachRole($staffRole);
            }
        });

        // 100 Members
        factory(User::class, 100)->create([
            'church_id'    => $church->id,
            'usergroup_id' => 5,
        ])->each(function ($member) {
            factory(Userprofile::class, 1)->create([
                'user_id'   => $member->id,
                'church_id' => $member->church_id,
            ]);
        });

        // 20 Guests (membership_type distinguishes them from regular members)
        factory(User::class, 20)->create([
            'church_id'    => $church->id,
            'usergroup_id' => 5,
        ])->each(function ($guest) {
            factory(Userprofile::class, 1)->create([
                'user_id'         => $guest->id,
                'church_id'       => $guest->church_id,
                'membership_type' => 'guest',
            ]);
        });
    }
}
