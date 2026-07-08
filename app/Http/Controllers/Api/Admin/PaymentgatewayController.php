<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Paymentgateway;
use Illuminate\Http\Request;

/**
 * Payment gateway catalog for the Next.js admin console.
 *
 * index() remains the read-only picker used by the Payaccount form.
 * manage()/store/update/status/destroy mirror app/Http/Controllers/Admin/
 * Payment/PaymentgatewayController for the /console/paymentgateways page —
 * legacy exposed this to church admins even though `paymentgateways` is a
 * global table with no church_id (single-tenant deployments in practice);
 * ported as-is for parity, guarded by the same churchadmin middleware.
 */
class PaymentgatewayController extends Controller
{
    public function index(Request $request)
    {
        $gateways = Paymentgateway::where('status', 1)->get();

        return response()->json($gateways->map(fn (Paymentgateway $g) => [
            'id'          => $g->id,
            'gatewayname' => $g->gatewayname,
            'displayname' => $g->displayname,
            'currency'    => $g->currency,
        ]));
    }

    public function manage()
    {
        $gateways = Paymentgateway::orderBy('displayname')->get();

        return response()->json($gateways->map(fn (Paymentgateway $g) => [
            'id'           => $g->id,
            'gatewayname'  => $g->gatewayname,
            'displayname'  => $g->displayname,
            'currency'     => $g->currency,
            'instructions' => $g->instructions,
            'status'       => (bool) $g->status,
        ]));
    }

    private function rules(): array
    {
        return [
            'gatewayname'  => 'required|string|max:100',
            'displayname'  => 'required|string|max:255',
            'currency'     => 'nullable|string|max:10',
            'instructions' => 'nullable|string|max:2000',
            'status'       => 'required|boolean',
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $gateway = Paymentgateway::create($data);

        return response()->json(['success' => true, 'id' => $gateway->id], 201);
    }

    public function update(Request $request, $id)
    {
        $gateway = Paymentgateway::find($id);
        if (! $gateway) {
            return response()->json(['message' => 'Gateway not found'], 404);
        }

        $data = $request->validate($this->rules());
        $gateway->update($data);

        return response()->json(['success' => true]);
    }

    public function status(Request $request, $id)
    {
        $gateway = Paymentgateway::find($id);
        if (! $gateway) {
            return response()->json(['message' => 'Gateway not found'], 404);
        }

        $data = $request->validate(['status' => 'required|boolean']);
        $gateway->update(['status' => $data['status'] ? 1 : 0]);

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $gateway = Paymentgateway::find($id);
        if (! $gateway) {
            return response()->json(['message' => 'Gateway not found'], 404);
        }

        if (\App\Models\Payaccount::where('paymentgateway_id', $gateway->id)->exists()) {
            return response()->json(['message' => 'Gateway has pay accounts attached and cannot be deleted.'], 422);
        }

        $gateway->delete();

        return response()->json(['success' => true]);
    }
}
