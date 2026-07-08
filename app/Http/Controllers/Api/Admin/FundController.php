<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fund;
use App\Models\User;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Manually-recorded contributions (cash/cheque/card/demand-draft) CRUD for
 * the Next.js admin console (/console/funds). Mirrors
 * app/Http/Controllers/Admin/FundController — this is separate from
 * Donations, which are online payments made through the member portal
 * (Phase 4's donate flow); Funds are contributions an admin logs by hand.
 * The India-specific "PAN number required over ₹100,000" rule is dropped,
 * same relaxation applied to Members/Guests/Sub-admins in earlier phases.
 */
class FundController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Fund::with(['user.userprofile', 'payaccount.paymentgateway'])->where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->whereHas('user.userprofile', function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($method = $request->query('method')) {
            $query->where('method', $method);
        }

        $funds = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($funds->items())->map(fn (Fund $f) => $this->summarize($f)),
            'meta' => [
                'current_page' => $funds->currentPage(),
                'last_page'    => $funds->lastPage(),
                'total'        => $funds->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $fund = $this->findFund($request, $id);

        if (! $fund) {
            return response()->json(['message' => 'Fund not found'], 404);
        }

        return response()->json([
            ...$this->summarize($fund),
            'data'            => $fund->data,
            'payment_details' => $fund->payment_details,
            'comments'        => $fund->comments,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'membership'      => 'required|in:member,guest',
            'user_id'         => 'required_if:membership,member|nullable|integer',
            'first_name'      => 'required_if:membership,guest|nullable|string',
            'last_name'       => 'nullable|string',
            'address'         => 'nullable|string',
            'mobile_number'   => 'nullable|string',
            'amount'          => 'required|numeric|min:0.01',
            'method'          => 'required|in:bank,card,cash,cheque,demanddraft',
            'payment_details' => 'nullable|array',
            'status'          => 'required|in:request,pending,deposited,cancel',
            'comments'        => 'nullable|string',
        ]);

        $churchId = $request->user()->church_id;

        $fund = new Fund;
        $fund->church_id = $churchId;
        $fund->authorised_by = $request->user()->id;
        $fund->authorised_at = now();
        $fund->membership = $data['membership'];
        $fund->amount = $data['amount'];
        $fund->method = $data['method'];
        $fund->payment_details = $data['payment_details'] ?? null;
        $fund->status = $data['status'];
        $fund->comments = $data['status'] === 'cancel' ? ($data['comments'] ?? null) : null;
        $fund->uuid = uniqid();

        if ($data['membership'] === 'member') {
            $fund->user_id = $data['user_id'];
        } else {
            $fund->data = [
                'first_name'    => $data['first_name'] ?? null,
                'last_name'     => $data['last_name'] ?? null,
                'address'       => $data['address'] ?? null,
                'mobile_number' => $data['mobile_number'] ?? null,
            ];
        }

        $fund->save();

        $this->doActivityLog(
            $fund,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_FUND,
            'Fund Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $fund->id], 201);
    }

    public function update(Request $request, $id)
    {
        $fund = $this->findFund($request, $id);

        if (! $fund) {
            return response()->json(['message' => 'Fund not found'], 404);
        }

        $data = $request->validate([
            'amount'          => 'sometimes|required|numeric|min:0.01',
            'method'          => 'sometimes|required|in:bank,card,cash,cheque,demanddraft',
            'payment_details' => 'nullable|array',
            'status'          => 'sometimes|required|in:request,pending,deposited,cancel',
            'comments'        => 'nullable|string',
        ]);

        $fund->fill($data);
        if (isset($data['status'])) {
            $fund->comments = $data['status'] === 'cancel' ? ($data['comments'] ?? null) : null;
        }
        $fund->save();

        $this->doActivityLog(
            $fund,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_FUND,
            'Fund Details Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $fund = $this->findFund($request, $id);

        if (! $fund) {
            return response()->json(['message' => 'Fund not found'], 404);
        }

        $fund->delete();

        $this->doActivityLog(
            $fund,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_FUND,
            'Fund Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function members(Request $request)
    {
        $users = User::where('church_id', $request->user()->church_id)
            ->where('usergroup_id', 5)
            ->with('userprofile')
            ->get();

        return response()->json($users->map(fn (User $u) => [
            'id'   => $u->id,
            'name' => trim((optional($u->userprofile)->firstname ?? '') . ' ' . (optional($u->userprofile)->lastname ?? '')) ?: $u->name,
        ]));
    }

    private function findFund(Request $request, $id): ?Fund
    {
        return Fund::with(['user.userprofile', 'payaccount.paymentgateway'])
            ->where('church_id', $request->user()->church_id)
            ->find($id);
    }

    private function summarize(Fund $f): array
    {
        $name = $f->membership === 'member'
            ? (optional($f->user)->name ?? '—')
            : trim(($f->data['first_name'] ?? '') . ' ' . ($f->data['last_name'] ?? ''));

        return [
            'id'         => $f->id,
            'name'       => $name ?: '—',
            'membership' => $f->membership,
            'amount'     => $f->amount,
            'method'     => $f->method,
            'status'     => $f->status,
            'created_at' => $f->created_at,
        ];
    }
}
