<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

/**
 * Read/manage online donations (made through the member portal's donate
 * flow, Phase 4) for the Next.js admin console (/console/donations).
 * Mirrors app/Http/Controllers/Admin/DonationController — no create
 * endpoint here, donations originate from the member-facing flow, admins
 * only review status and can remove erroneous entries.
 */
class DonationController extends Controller
{
    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Donation::with('user.userprofile')->where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->whereHas('user.userprofile', function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $donations = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($donations->items())->map(fn (Donation $d) => $this->summarize($d)),
            'meta' => [
                'current_page' => $donations->currentPage(),
                'last_page'    => $donations->lastPage(),
                'total'        => $donations->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $donation = $this->findDonation($request, $id);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        return response()->json($this->summarize($donation));
    }

    public function updateStatus(Request $request, $id)
    {
        $donation = $this->findDonation($request, $id);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        $data = $request->validate(['status' => 'required|in:pending,completed,cancelled']);
        $donation->status = $data['status'];
        $donation->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $donation = $this->findDonation($request, $id);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        $donation->delete();

        return response()->json(['success' => true]);
    }

    private function findDonation(Request $request, $id): ?Donation
    {
        return Donation::with('user.userprofile')->where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Donation $d): array
    {
        return [
            'id'         => $d->id,
            'name'       => trim((optional(optional($d->user)->userprofile)->firstname ?? '') . ' ' . (optional(optional($d->user)->userprofile)->lastname ?? '')) ?: optional($d->user)->name,
            'email'      => optional($d->user)->email,
            'amount'     => $d->amount,
            'currency'   => $d->currency,
            'category'   => $d->category,
            'method'     => $d->method,
            'status'     => $d->status,
            'note'       => $d->note,
            'donated_at' => $d->donated_at ?? $d->created_at,
        ];
    }
}
