<?php

namespace Database\Seeders;

use App\Models\Church;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Tops up the engagement/communication side of the demo data that
 * DemoDataSeeder doesn't cover: donations (offerings), sent messages,
 * help requests, active prayers, feedback threads, mailing lists,
 * subscribers, a campaign, and group messages.
 *
 * Idempotent: skips itself if its marker donation already exists.
 *
 * Usage: php artisan db:seed --class=DummyEngagementSeeder
 */
class DummyEngagementSeeder extends Seeder
{
    private const MARKER = 'engagement-seeder-v1';

    public function run()
    {
        $church = Church::where('status', 1)->first();
        if (! $church) {
            $this->command->error('No active church found.');
            return;
        }
        $cid = $church->id;

        $memberIds = DB::table('users')->where('church_id', $cid)->where('usergroup_id', 5)->pluck('id')->all();
        $adminId   = DB::table('users')->where('church_id', $cid)->where('usergroup_id', 3)->value('id') ?? 1;
        $now       = now();

        // Each section guards itself on a sentinel row so a partial
        // earlier run (or a rerun) only fills in what is missing.
        $done = fn (string $table, string $col, string $val) => DB::table($table)->where($col, $val)->exists();

        // ── Donations / offerings, spread over the last 90 days ──────
        if (! $done('donations', 'note', self::MARKER)) {
        $categories = ['Offering', 'Tithe', 'Building Fund', 'Missions'];
        $rows = [];
        foreach (range(1, 14) as $i) {
            $donatedAt = $now->copy()->subDays(rand(0, 90))->setTime(rand(8, 20), rand(0, 59));
            $rows[] = [
                'church_id'  => $cid,
                'user_id'    => $memberIds[array_rand($memberIds)],
                'amount'     => [10, 20, 25, 50, 75, 100, 150, 250][array_rand([10, 20, 25, 50, 75, 100, 150, 250])],
                'currency'   => 'USD',
                'category'   => $categories[array_rand($categories)],
                'method'     => 'cash',
                'status'     => $i <= 11 ? 'completed' : ($i <= 13 ? 'pending' : 'cancelled'),
                'note'       => $i === 1 ? self::MARKER : null,
                'uuid'       => (string) Str::uuid(),
                'donated_at' => $donatedAt,
                'created_at' => $donatedAt,
                'updated_at' => $donatedAt,
            ];
        }
        DB::table('donations')->insert($rows);
        }

        // ── Sent message batches (email + sms), as the console's
        //    Messages screen groups them by batch_id ──────────────────
if (! $done('send_mail', 'subject', 'Building Fund Update')) {
                $emails  = DB::table('users')->whereIn('id', $memberIds)->whereNotNull('email')->pluck('email', 'id')->all();
        $phones  = DB::table('users')->whereIn('id', $memberIds)->whereNotNull('mobile_no')->pluck('mobile_no', 'id')->all();
        $batches = [
            ['mode' => 'mail', 'subject' => 'Sunday Service — This Week at Church', 'message' => 'Join us this Sunday at 10am for worship. Pastor continues the series "Rooted in Grace". Coffee and fellowship after the service.', 'days_ago' => 12],
            ['mode' => 'sms',   'subject' => null, 'message' => 'Reminder: prayer meeting Wednesday 6pm in the fellowship hall. All are welcome!', 'days_ago' => 6],
            ['mode' => 'mail', 'subject' => 'Building Fund Update', 'message' => 'Thanks to your generosity we have reached 60% of our building fund goal. Read the full update and next steps on the website.', 'days_ago' => 2],
        ];
        foreach ($batches as $batch) {
            $batchId = (string) Str::uuid();
            $sentAt  = $now->copy()->subDays($batch['days_ago'])->setTime(9, 30);
            $targets = $batch['mode'] === 'mail' ? $emails : $phones;
            $rows = [];
            foreach (array_slice($targets, 0, $batch['mode'] === 'mail' ? 5 : 4, true) as $userId => $to) {
                $rows[] = [
                    'church_id'   => $cid,
                    'user_id'     => $userId,
                    'from'        => 'a4nsah@gmail.com',
                    'to'          => $to,
                    'mode'        => $batch['mode'],
                    'subject'     => $batch['subject'],
                    'message'     => $batch['message'],
                    'status'      => 'delivered',
                    'batch_id'    => $batchId,
                    'is_executed' => 1,
                    'executed_at' => $sentAt,
                    'fired_at'    => $sentAt,
                    'read_status' => rand(0, 1),
                    'created_at'  => $sentAt,
                    'updated_at'  => $sentAt,
                ];
            }
            DB::table('send_mail')->insert($rows);
        }
        }

        // ── Help requests (2 approved + 1 pending for moderation) ────
if (! $done('helps', 'title', 'Ride to church needed')) {
                foreach ([
            ['title' => 'Ride to church needed', 'description' => 'My car broke down and I would love a ride to Sunday service from the Riverside area for the next few weeks.', 'status' => 'approve', 'days_ago' => 9],
            ['title' => 'Meal train for the Mensah family', 'description' => 'The Mensahs just welcomed twins! Sign up to bring a meal this month and give the new parents a hand.', 'status' => 'approve', 'days_ago' => 4],
            ['title' => 'Help moving furniture', 'description' => 'Moving to a new apartment on the 20th and could use two or three strong volunteers for a couple of hours.', 'status' => 'pending', 'days_ago' => 1],
        ] as $help) {
            $created = $now->copy()->subDays($help['days_ago']);
            DB::table('helps')->insert([
                'church_id'       => $cid,
                'user_id'         => $memberIds[array_rand($memberIds)],
                'title'           => $help['title'],
                'description'     => $help['description'],
                'contact_details' => 'Reach me through the church office',
                'status'          => $help['status'],
                'expired_at'      => $created->copy()->addDays(30),
                'created_at'      => $created,
                'updated_at'      => $created,
            ]);
        }
        }

        // ── Active prayers with participation counts ─────────────────
if (! $done('prayers', 'text', 'Asking for prayer as I start a new job on Monday. Grateful and a little nervous!')) {
                $categoryIds = DB::table('prayer_categories')->where('church_id', $cid)->pluck('id')->all();
        foreach ([
            ['text' => 'Praise report — my mother came through surgery safely. Please pray for a smooth recovery over the coming weeks.', 'm' => 5, 'g' => 3],
            ['text' => 'Please pray for my final exams this month, for calm and clarity of mind.', 'm' => 2, 'g' => 4],
            ['text' => 'Pray for our missions team traveling to Tamale next week — safe travels and open doors.', 'm' => 7, 'g' => 2],
            ['text' => 'Asking for prayer as I start a new job on Monday. Grateful and a little nervous!', 'm' => 3, 'g' => 1],
        ] as $i => $prayer) {
            $created = $now->copy()->subDays(3 + $i * 2);
            DB::table('prayers')->insert([
                'church_id'       => $cid,
                'category_id'     => $categoryIds ? $categoryIds[array_rand($categoryIds)] : null,
                'user_id'         => $memberIds[array_rand($memberIds)],
                'text'            => $prayer['text'],
                'original_text'   => $prayer['text'],
                'status'          => 'ACTIVE',
                'approved_by'     => $adminId,
                'approved_at'     => $created,
                'expiry_days'     => 30,
                'expires_at'      => $created->copy()->addDays(30),
                'member_count'    => $prayer['m'],
                'guest_count'     => $prayer['g'],
                'anonymous_count' => 0,
                'created_at'      => $created,
                'updated_at'      => $created,
            ]);
        }
        }

        // ── Feedback threads ─────────────────────────────────────────
if (! $done('feedback_messages', 'message', 'Thank you for organising the youth retreat, my son had an amazing time.')) {
                foreach ([
            ['name' => 'Andrew Ansah', 'status' => 1, 'messages' => ['The new website looks wonderful — so much easier to find sermons now!', 'One suggestion: could the events page show a map for venue locations?']],
            ['name' => 'Grace Owusu',  'status' => 1, 'messages' => ['The audio on last Sunday\'s livestream was very quiet, could someone look into it?']],
            ['name' => 'Kofi Boateng', 'status' => 0, 'messages' => ['Thank you for organising the youth retreat, my son had an amazing time.']],
        ] as $fb) {
            if (DB::table('feedback_messages')->where('message', $fb['messages'][0])->exists()) {
                continue;
            }
            $created = $now->copy()->subDays(rand(1, 14));
            $userId  = $memberIds[array_rand($memberIds)];
            $feedbackId = DB::table('feedbacks')->insertGetId([
                'church_id'  => $cid,
                'name'       => $userId, // legacy int column; console reads the user relation
                'user_id'    => $userId,
                'admin_id'   => $adminId,
                'status'     => $fb['status'],
                'created_at' => $created,
                'updated_at' => $created,
            ]);
            foreach ($fb['messages'] as $j => $message) {
                DB::table('feedback_messages')->insert([
                    'church_id'   => $cid,
                    'user_id'     => $userId,
                    'feedback_id' => $feedbackId,
                    'message'     => $message,
                    'is_seen'     => $j === 0 ? 'has_seen' : '0',
                    'created_at'  => $created->copy()->addMinutes($j * 30),
                    'updated_at'  => $created->copy()->addMinutes($j * 30),
                ]);
            }
        }
        }

        // ── Mailing lists, subscribers, campaign ─────────────────────
if (! $done('mailinglists', 'slug', 'weekly-newsletter')) {
                $listIds = [];
        foreach ([
            ['name' => 'Weekly Newsletter', 'scope' => 'subscription', 'description' => 'Church news, upcoming events and the weekly bulletin in your inbox every Friday.'],
            ['name' => 'Youth Ministry Updates', 'scope' => 'campaign', 'description' => 'Announcements for parents and young adults about youth events and retreats.'],
        ] as $list) {
            $listIds[] = DB::table('mailinglists')->insertGetId([
                'church_id'    => $cid,
                'scope'        => $list['scope'],
                'name'         => $list['name'],
                'description'  => $list['description'],
                'is_published' => 1,
                'slug'         => Str::slug($list['name']),
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }
        foreach ([
            ['ama.serwaa@example.com', 'Ama', 'Serwaa'],
            ['kwame.asante@example.com', 'Kwame', 'Asante'],
            ['efua.mansa@example.com', 'Efua', 'Mansa'],
            ['yaw.darko@example.com', 'Yaw', 'Darko'],
            ['abena.frimpong@example.com', 'Abena', 'Frimpong'],
            ['kojo.antwi@example.com', 'Kojo', 'Antwi'],
        ] as $i => [$email, $first, $last]) {
            $subId = DB::table('subscribers')->insertGetId([
                'church_id'  => $cid,
                'email'      => $email,
                'firstname'  => $first,
                'lastname'   => $last,
                'source'     => 'website',
                'is_active'  => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            DB::table('mailing_list_subscribers')->insert([
                'mailing_list_id' => $listIds[$i % 2],
                'subscribers_id'  => $subId,
                'status'          => 1,
                'created_at'      => $now,
                'updated_at'      => $now,
            ]);
        }
        DB::table('campaign')->insert([
            'church_id'      => $cid,
            'name'           => 'Friday Newsletter — July',
            'description'    => 'July edition of the weekly newsletter with the building fund update.',
            'status'         => 1,
            'mailinglist_id' => $listIds[0],
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);
        }

        // ── Group messages ───────────────────────────────────────────
if (! $done('group_posts', 'title', 'Prayer partners')) {
                $groupIds = DB::table('groups')->where('church_id', $cid)->pluck('id')->all();
        foreach ([
            ['title' => 'Bible study this Thursday', 'message' => 'We are picking up in Romans 8 this Thursday at 7pm — bring a friend!'],
            ['title' => 'Volunteers needed Saturday', 'message' => 'We need four volunteers for the community clean-up on Saturday morning. Reply here if you can make it.'],
            ['title' => null, 'message' => 'Great turnout last week everyone, thank you! Photos are up in the gallery.'],
            ['title' => 'Prayer partners', 'message' => 'If you would like to be paired with a prayer partner this quarter, drop a message below.'],
        ] as $i => $post) {
            $created = $now->copy()->subDays(rand(0, 10));
            DB::table('group_posts')->insert([
                'church_id'  => $cid,
                'user_id'    => $i === 0 ? $adminId : $memberIds[array_rand($memberIds)],
                'group_id'   => $groupIds[$i % count($groupIds)],
                'title'      => $post['title'],
                'message'    => $post['message'],
                'status'     => 'active',
                'created_at' => $created,
                'updated_at' => $created,
            ]);
        }
        }

        // ── Approved blog comments ───────────────────────────────────
if (! $done('post_comments', 'comments', 'Beautifully written. God bless.')) {
                $postIds = DB::table('posts')->pluck('id')->all();
        foreach ([
            'This is exactly what I needed to read this week, thank you Pastor.',
            'Looking forward to the next one in this series!',
            'Shared this with my small group — sparked a great discussion.',
            'Beautifully written. God bless.',
        ] as $i => $comment) {
            $created = $now->copy()->subDays(rand(0, 12));
            DB::table('post_comments')->insert([
                'user_id'           => $memberIds[array_rand($memberIds)],
                'entity_id'         => $postIds[$i % count($postIds)],
                'entity_name'       => \App\Models\Post::class,
                'comments'          => $comment,
                'status'            => 1,
                'public_like_count' => rand(0, 6),
                'created_at'        => $created,
                'updated_at'        => $created,
            ]);
        }
        }

        // ── Empty tables covered by existing seeders ─────────────────
        if (DB::table('widgets')->count() === 0) {
            $this->call(DummyWidgetSeeder::class);
        }
        if (DB::table('tags')->count() === 0) {
            $this->call(DummyTagDataSeeder::class);
        }

        $this->command->info('Engagement demo data seeded.');
    }
}
