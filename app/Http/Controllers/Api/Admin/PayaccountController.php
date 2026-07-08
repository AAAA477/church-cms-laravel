<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payaccount;
use App\Models\Paymentgateway;
use Illuminate\Http\Request;

/**
 * Church-specific payment account configuration (which gateway the church
 * accepts payments through, and its credentials) for the Next.js admin
 * console (/console/payaccounts). Mirrors app/Http/Controllers/Admin/
 * Payment/PayaccountContorller — the legacy switch-per-gatewayname mapping
 * of named fields (public_key/secret_key/account_number/etc.) to generic
 * param1-8 columns is kept, since payaccounts.param1-8 is the actual
 * schema; the frontend sends `params` as an ordered array and this
 * controller just stores it positionally.
 */
class PayaccountController extends Controller
{
    public function index(Request $request)
    {
        $payaccounts = Payaccount::with('paymentgateway')->where('church_id', $request->user()->church_id)->get();

        return response()->json($payaccounts->map(fn (Payaccount $p) => $this->summarize($p)));
    }

    public function show(Request $request, $id)
    {
        $payaccount = $this->findPayaccount($request, $id);

        if (! $payaccount) {
            return response()->json(['message' => 'Pay account not found'], 404);
        }

        return response()->json([
            ...$this->summarize($payaccount),
            'params' => [
                $payaccount->param1, $payaccount->param2, $payaccount->param3, $payaccount->param4,
                $payaccount->param5, $payaccount->param6, $payaccount->param7, $payaccount->param8,
            ],
            'comments' => $payaccount->comments,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'paymentgateway_id' => 'required|integer|exists:paymentgateways,id',
            'status'            => 'required|boolean',
            'comments'          => 'nullable|string',
            'params'            => 'nullable|array|max:8',
        ]);

        $churchId = $request->user()->church_id;
        $params = $this->paramsToColumns($data['params'] ?? []);

        if ($data['status']) {
            Payaccount::where('church_id', $churchId)
                ->where('paymentgateway_id', $data['paymentgateway_id'])
                ->update(['status' => 0]);
        }

        $payaccount = Payaccount::create([
            'church_id'         => $churchId,
            'paymentgateway_id' => $data['paymentgateway_id'],
            'status'            => $data['status'],
            'comments'          => $data['comments'] ?? null,
            ...$params,
        ]);

        return response()->json(['success' => true, 'id' => $payaccount->id], 201);
    }

    public function update(Request $request, $id)
    {
        $payaccount = $this->findPayaccount($request, $id);

        if (! $payaccount) {
            return response()->json(['message' => 'Pay account not found'], 404);
        }

        $data = $request->validate([
            'paymentgateway_id' => 'sometimes|required|integer|exists:paymentgateways,id',
            'status'            => 'sometimes|required|boolean',
            'comments'          => 'nullable|string',
            'params'            => 'nullable|array|max:8',
        ]);

        $params = isset($data['params']) ? $this->paramsToColumns($data['params']) : [];
        unset($data['params']);

        $payaccount->fill([...$data, ...$params]);
        $payaccount->save();

        if ($payaccount->status) {
            Payaccount::where('id', '!=', $payaccount->id)
                ->where('church_id', $payaccount->church_id)
                ->where('paymentgateway_id', $payaccount->paymentgateway_id)
                ->update(['status' => 0]);
        }

        return response()->json(['success' => true]);
    }

    public function statusUpdate(Request $request, $id)
    {
        $payaccount = $this->findPayaccount($request, $id);

        if (! $payaccount) {
            return response()->json(['message' => 'Pay account not found'], 404);
        }

        $payaccount->status = ! $payaccount->status;
        $payaccount->save();

        if ($payaccount->status) {
            Payaccount::where('id', '!=', $payaccount->id)
                ->where('church_id', $payaccount->church_id)
                ->where('paymentgateway_id', $payaccount->paymentgateway_id)
                ->update(['status' => 0]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $payaccount = $this->findPayaccount($request, $id);

        if (! $payaccount) {
            return response()->json(['message' => 'Pay account not found'], 404);
        }

        $payaccount->delete();

        return response()->json(['success' => true]);
    }

    private function paramsToColumns(array $params): array
    {
        $columns = [];
        foreach (range(1, 8) as $i) {
            $columns["param{$i}"] = $params[$i - 1] ?? null;
        }

        return $columns;
    }

    private function findPayaccount(Request $request, $id): ?Payaccount
    {
        return Payaccount::with('paymentgateway')->where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Payaccount $p): array
    {
        return [
            'id'                => $p->id,
            'paymentgateway_id' => $p->paymentgateway_id,
            'gateway_name'      => optional($p->paymentgateway)->gatewayname,
            'gateway_display'   => optional($p->paymentgateway)->displayname,
            'status'            => (bool) $p->status,
        ];
    }
}
