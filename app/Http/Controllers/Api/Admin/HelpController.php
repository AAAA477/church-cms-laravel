<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Help;
use App\Traits\Common;
use App\Traits\LogActivity;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Help Requests moderation for the Next.js admin console
 * (/console/helps). Mirrors app/Http/Controllers/Admin/HelpsController's
 * status-tab index + update (approve with expiry / reject or close with
 * comments). Request creation stays member-facing (App\Repositories\
 * HelpRepositoryInterface, used by the mobile/member API) — this console
 * only moderates existing requests.
 */
class HelpController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;
        $status = $request->query('status', 'pending');

        $query = Help::where('church_id', $churchId)->where('status', $status)->with('user');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $helps = $query->latest()->paginate(15);

        $counts = Help::where('church_id', $churchId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'counts' => $counts,
            'data'   => collect($helps->items())->map(fn (Help $h) => $this->summarize($h)),
            'meta'   => [
                'current_page' => $helps->currentPage(),
                'last_page'    => $helps->lastPage(),
                'total'        => $helps->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $help = $this->findHelp($request, $id);

        if (! $help) {
            return response()->json(['message' => 'Help request not found'], 404);
        }

        return response()->json($this->summarize($help));
    }

    public function update(Request $request, $id)
    {
        $help = $this->findHelp($request, $id);

        if (! $help) {
            return response()->json(['message' => 'Help request not found'], 404);
        }

        $data = $request->validate([
            'status'      => 'required|in:pending,approve,reject,close',
            'expired_at'  => 'required_if:status,approve|nullable|integer|min:1',
            'comments'    => 'nullable|string',
        ]);

        $help->status = $data['status'];
        if ($data['status'] === 'approve') {
            $help->expired_at = Carbon::now()->addDays((int) $data['expired_at']);
            $help->closed_by = $request->user()->id;
        } else {
            $help->comments = $data['comments'] ?? null;
        }
        $help->save();

        $this->doActivityLog(
            $help,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_APPROVED_HELP,
            'Help Status Updated'
        );

        return response()->json(['success' => true]);
    }

    private function findHelp(Request $request, $id): ?Help
    {
        return Help::where('church_id', $request->user()->church_id)->with('user')->find($id);
    }

    private function summarize(Help $h): array
    {
        return [
            'id'              => $h->id,
            'title'           => $h->title,
            'description'     => $h->description,
            'contact_details' => $h->contact_details,
            'status'          => $h->status,
            'comments'        => $h->comments,
            'expired_at'      => $h->expired_at,
            'user'            => optional($h->user)->name,
            'created_at'      => $h->created_at,
        ];
    }
}
