<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prayer;
use Illuminate\Http\Request;

/**
 * Prayer Board moderation for the Next.js admin console
 * (/console/prayer-board). Mirrors app/Http/Controllers/Admin/
 * PrayerBoardController — the `Prayer` model already encapsulates the whole
 * state machine (approve/reject/markAnswered/pin/unpin/extend/unpublish),
 * including its own Spatie activity-log entries, so this controller is a
 * thin wrapper, not a reimplementation.
 */
class PrayerController extends Controller
{
    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $counts = [
            'pending'  => Prayer::forChurch($churchId)->pending()->count(),
            'active'   => Prayer::forChurch($churchId)->active()->count(),
            'answered' => Prayer::forChurch($churchId)->answered()->count(),
            'ended'    => Prayer::forChurch($churchId)->ended()->count(),
            'rejected' => Prayer::forChurch($churchId)->rejected()->count(),
        ];

        $status = $request->query('status', 'pending');
        $allowed = [
            'pending'  => Prayer::STATUS_PENDING,
            'active'   => Prayer::STATUS_ACTIVE,
            'answered' => Prayer::STATUS_ANSWERED,
            'ended'    => Prayer::STATUS_ENDED,
            'rejected' => Prayer::STATUS_REJECTED,
        ];

        if (! array_key_exists($status, $allowed)) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        $prayers = Prayer::forChurch($churchId)
            ->where('status', $allowed[$status])
            ->with(['category', 'user'])
            ->recent()
            ->paginate(15);

        return response()->json([
            'counts' => $counts,
            'data'   => collect($prayers->items())->map(fn (Prayer $p) => $this->summarize($p)),
            'meta'   => [
                'current_page' => $prayers->currentPage(),
                'last_page'    => $prayers->lastPage(),
                'total'        => $prayers->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        $prayer->load(['category', 'user', 'approver', 'rejector', 'pinner', 'answerer']);

        return response()->json([
            ...$this->summarize($prayer),
            'original_text'    => $prayer->original_text,
            'rejection_reason' => $prayer->rejection_reason,
            'answer_testimony' => $prayer->answer_testimony,
            'expires_at'       => $prayer->expires_at,
            'approver'         => optional($prayer->approver)->name,
            'rejector'         => optional($prayer->rejector)->name,
        ]);
    }

    public function approve(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        if ($prayer->status !== Prayer::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending prayers can be approved.'], 422);
        }

        $data = $request->validate(['expiry_days' => 'required|integer|min:1', 'text' => 'nullable|string']);

        if (! empty($data['text']) && $data['text'] !== $prayer->text) {
            $prayer->update(['text' => $data['text']]);
        }

        $prayer->approve($request->user(), $data['expiry_days']);

        return response()->json(['success' => true]);
    }

    public function reject(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        if ($prayer->status !== Prayer::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending prayers can be rejected.'], 422);
        }

        $data = $request->validate(['reason' => 'required|string']);
        $prayer->reject($request->user(), $data['reason']);

        return response()->json(['success' => true]);
    }

    public function markAnswered(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        if ($prayer->status !== Prayer::STATUS_ACTIVE) {
            return response()->json(['message' => 'Only active prayers can be marked as answered.'], 422);
        }

        $data = $request->validate(['testimony' => 'nullable|string']);
        $prayer->markAnswered($request->user(), $data['testimony'] ?? null);

        return response()->json(['success' => true]);
    }

    public function pin(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        if ($prayer->status !== Prayer::STATUS_ACTIVE) {
            return response()->json(['message' => 'Only active prayers can be pinned.'], 422);
        }

        $prayer->pin($request->user());

        return response()->json(['success' => true]);
    }

    public function unpin(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        $prayer->unpin($request->user());

        return response()->json(['success' => true]);
    }

    public function extend(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        if ($prayer->status !== Prayer::STATUS_ACTIVE) {
            return response()->json(['message' => 'Only active prayers can be extended.'], 422);
        }

        $data = $request->validate(['additional_days' => 'required|integer|in:7,14,30,60']);
        $prayer->extend($request->user(), $data['additional_days']);

        return response()->json(['success' => true]);
    }

    public function unpublish(Request $request, $id)
    {
        $prayer = $this->findPrayer($request, $id);

        if (! $prayer) {
            return response()->json(['message' => 'Prayer not found'], 404);
        }

        if ($prayer->status !== Prayer::STATUS_ACTIVE) {
            return response()->json(['message' => 'Only active prayers can be unpublished.'], 422);
        }

        $prayer->unpublish($request->user());

        return response()->json(['success' => true]);
    }

    private function findPrayer(Request $request, $id): ?Prayer
    {
        return Prayer::forChurch($request->user()->church_id)->find($id);
    }

    private function summarize(Prayer $p): array
    {
        return [
            'id'         => $p->id,
            'text'       => $p->text,
            'status'     => $p->status,
            'category'   => optional($p->category)->name,
            'user'       => optional($p->user)->name,
            'pinned'     => (bool) $p->pinned_at,
            'created_at' => $p->created_at,
        ];
    }
}
