<?php

namespace Database\Seeders;

use App\Models\Church;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Fills the community side of the demo data: upcoming events (the only
 * pre-existing event was in the past), extra active members, and group
 * memberships so member dashboards and console lists look lived-in.
 *
 * Sections guard themselves on sentinel rows, so reruns only fill gaps.
 *
 * Usage: php artisan db:seed --class=DummyCommunitySeeder
 */
class DummyCommunitySeeder extends Seeder
{
    public function run()
    {
        $church = Church::where('status', 1)->first();
        if (! $church) {
            $this->command->error('No active church found.');
            return;
        }
        $cid     = $church->id;
        $adminId = DB::table('users')->where('church_id', $cid)->where('usergroup_id', 3)->value('id') ?? 1;
        $now     = now();

        // ── Clean up the junk-titled leftover test event ──────────────
        DB::table('events')->where('church_id', $cid)->where('title', 'v bv')->update([
            'title'        => 'Youth Sunday Service',
            'description'  => 'A special service led by our youth ministry, with worship, testimonies and a shared lunch afterwards.',
            'location'     => 'Main Sanctuary',
            'organised_by' => 'Youth Ministry',
        ]);

        // ── Upcoming events ──────────────────────────────────────────
        if (! DB::table('events')->where('title', 'Community Outreach & Clean-up')->exists()) {
            $events = [
                ['title' => 'Sunday Worship Service', 'description' => 'Join us for worship, the Word, and fellowship. All are welcome — come as you are.', 'category' => 'sermon', 'location' => 'Main Sanctuary', 'organised_by' => 'PIWC North', 'in_days' => 4, 'hour' => 10, 'duration' => 120],
                ['title' => 'Midweek Prayer Meeting', 'description' => 'An evening of intercession and thanksgiving in the fellowship hall.', 'category' => 'prayer', 'location' => 'Fellowship Hall', 'organised_by' => 'Prayer Team', 'in_days' => 7, 'hour' => 18, 'duration' => 90],
                ['title' => 'Community Outreach & Clean-up', 'description' => 'We are serving our neighbourhood — join a team, bring gloves, and share the love of Christ practically.', 'category' => 'culturals', 'location' => 'Church Grounds (meet-up point)', 'organised_by' => 'Outreach Committee', 'in_days' => 12, 'hour' => 8, 'duration' => 240],
                ['title' => 'New Members\' Class', 'description' => 'An introduction to our church family, beliefs, and ministries for new and prospective members.', 'category' => 'education', 'location' => 'Room 2, Annex Building', 'organised_by' => 'Discipleship Team', 'in_days' => 18, 'hour' => 9, 'duration' => 150],
                ['title' => 'Leaders\' Planning Meeting', 'description' => 'Quarterly planning and prayer meeting for all ministry and group leaders.', 'category' => 'meeting', 'location' => 'Conference Room', 'organised_by' => 'Church Office', 'in_days' => 25, 'hour' => 17, 'duration' => 120],
            ];
            foreach ($events as $event) {
                $start = $now->copy()->addDays($event['in_days'])->setTime($event['hour'], 0);
                DB::table('events')->insert([
                    'church_id'         => $cid,
                    'select_type'       => 'public',
                    'title'             => $event['title'],
                    'description'       => $event['description'],
                    'repeats'           => 0,
                    'duration_minutes'  => $event['duration'],
                    'location'          => $event['location'],
                    'category'          => $event['category'],
                    'organised_by'      => $event['organised_by'],
                    'image'             => '',
                    'start_date'        => $start,
                    'end_date'          => $start->copy()->addMinutes($event['duration']),
                    'allDay'            => 0,
                    'publish_to_web'    => 1,
                    'enable_gallery'    => 0,
                    'enable_attendance' => 1,
                    'attendance_scope'  => 'all',
                    'created_by'        => $adminId,
                    'updated_by'        => $adminId,
                    'created_at'        => $now,
                    'updated_at'        => $now,
                ]);
            }
        }

        // ── Extra active members with group memberships ──────────────
        if (! DB::table('users')->where('email', 'kwabena.osei@example.com')->exists()) {
            $members = [
                ['Kwabena', 'Osei', 'male', 'kwabena.osei@example.com', '0244100001', 'teacher', '1988-03-14'],
                ['Akosua', 'Boateng', 'female', 'akosua.boateng@example.com', '0244100002', 'business', '1992-11-02'],
                ['Yaw', 'Mensah', 'male', 'yaw.mensah@example.com', '0244100003', 'engineer', '1985-07-21'],
                ['Adwoa', 'Asantewaa', 'female', 'adwoa.asantewaa@example.com', '0244100004', 'student', '2001-01-30'],
                ['Kofi', 'Adjei', 'male', 'kofi.adjei@example.com', '0244100005', 'self_employed', '1979-09-08'],
            ];
            $groupIds = DB::table('groups')->where('church_id', $cid)->whereNull('deleted_at')->pluck('id')->all();

            foreach ($members as $i => [$first, $last, $gender, $email, $mobile, $profession, $dob]) {
                $userId = DB::table('users')->insertGetId([
                    'church_id'    => $cid,
                    'usergroup_id' => 5,
                    'name'         => strtolower($first) . rand(100, 999),
                    'email'        => $email,
                    'mobile_no'    => $mobile,
                    'password'     => Hash::make('MemberDemo#2026'),
                    'created_at'   => $now->copy()->subDays(30 + $i * 7),
                    'updated_at'   => $now,
                ]);
                DB::table('userprofiles')->insert([
                    'church_id'       => $cid,
                    'user_id'         => $userId,
                    'firstname'       => $first,
                    'lastname'        => $last,
                    'gender'          => $gender,
                    'date_of_birth'   => $dob,
                    'profession'      => $profession,
                    'membership_type' => 'member',
                    'status'          => 'active',
                    'created_at'      => $now->copy()->subDays(30 + $i * 7),
                    'updated_at'      => $now,
                ]);
                if ($groupIds) {
                    DB::table('group_links')->insert([
                        'church_id'  => $cid,
                        'user_id'    => $userId,
                        'group_id'   => $groupIds[$i % count($groupIds)],
                        'role'       => 'member',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        $this->command->info('Community demo data seeded.');
    }
}
