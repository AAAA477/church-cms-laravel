<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sermon;
use App\Models\Userprofile;
use App\Traits\Dashboard;
use Illuminate\Http\Request;

/**
 * JSON shape of the admin dashboard for the Next.js console, reusing the
 * exact same cached aggregates as the Blade admin dashboard (App\Traits\
 * Dashboard::adminDashboard) rather than re-querying — same cache keys,
 * same TTL, so writes elsewhere in the app still invalidate correctly.
 */
class DashboardController extends Controller
{
    use Dashboard;

    public function index(Request $request)
    {
        $user = $request->user();
        $data = $this->adminDashboard($user->church_id, $user->id);

        return response()->json([
            'stats' => [
                'members'       => $data['memberCount'],
                'male_members'  => $data['maleMemberCount'],
                'female_members' => $data['femaleMemberCount'],
                'guests'        => $data['guestCount'],
                'male_guests'   => $data['maleGuestCount'],
                'female_guests' => $data['femaleGuestCount'],
                'events'        => $data['eventCount'],
                'galleries'     => $data['galleryCount'],
                'files'         => $data['fileCount'],
                'bulletins'     => $data['bulletinCount'],
                'groups'        => $data['groupCount'],
                'pending_prayers' => $data['pendingPrayerCount'],
                'pending_helps'   => $data['pendingHelpCount'],
                'total_fund'      => (float) $data['total_fund'],
            ],
            'recent_members' => $data['recentMember']->map(fn ($u) => [
                'id'    => $u->id,
                'name'  => $u->FullName,
                'email' => $u->email,
                'city'  => optional(optional($u->userprofile)->city)->name,
            ]),
            'upcoming_events' => $data['upcomingEvents']->map(fn ($e) => [
                'id'         => $e->id,
                'title'      => $e->title,
                'start_date' => $e->start_date,
                'location'   => $e->location,
            ]),
            'pending_prayers' => $data['pendingPrayers']->map(fn ($p) => [
                'id'   => $p->id,
                'text' => $p->text,
                'name' => optional($p->user)->FullName ?? $p->submitter_name,
            ]),
            'pending_helps' => $data['pendingHelps']->map(fn ($h) => [
                'id'    => $h->id,
                'title' => $h->title,
                'name'  => optional($h->user)->FullName,
            ]),
            // Legacy dashboard widgets: today's birthdays/anniversaries
            // (Admin\BirthdayController@showBirthday/@showAnniversary),
            // latest sermons, and the monthly offerings chart (the
            // CanvasJS 'final' series from the Dashboard trait).
            'birthdays' => Userprofile::with('user')
                ->whereRaw("DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(now(),'%m-%d')")
                ->ByChurch($user->church_id)
                ->ByRole(5)
                ->get()
                ->map(fn ($p) => [
                    'id'   => $p->user_id,
                    'name' => trim(($p->firstname ?? '') . ' ' . ($p->lastname ?? '')),
                ])->values(),
            'anniversaries' => Userprofile::with('user')
                ->whereRaw("DATE_FORMAT(marriage_start_date, '%m-%d') = DATE_FORMAT(now(),'%m-%d')")
                ->ByChurch($user->church_id)
                ->ByRole(5)
                ->get()
                ->map(fn ($p) => [
                    'id'   => $p->user_id,
                    'name' => trim(($p->firstname ?? '') . ' ' . ($p->lastname ?? '')),
                ])->values(),
            'latest_sermons' => Sermon::where('church_id', $user->church_id)
                ->orderByDesc('created_at')
                ->take(5)
                ->get()
                ->map(fn ($s) => [
                    'id'    => $s->id,
                    'title' => $s->title,
                    'date'  => optional($s->created_at)->format('d M Y'),
                ]),
            'offerings_chart' => collect($data['final'] ?? [])->map(fn ($point) => [
                'label'  => $point['label'],
                'amount' => (float) $point['y'],
            ])->values(),
        ]);
    }
}
