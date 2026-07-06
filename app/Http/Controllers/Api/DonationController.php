<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payment\PaystackService;
use App\Services\Payment\FlutterwaveService;
use App\Services\Payment\MpesaService;
use App\Services\Payment\GCashService;
use App\Services\Payment\StripeService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use App\Models\Payaccount;
use App\Models\Donation;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\Paymentgateway;

/**
 * JSON API port of Member\DonationController for the Next.js member portal.
 *
 * Differences from the web controller:
 * - auth:sanctum (bearer token) instead of web session auth
 * - JSON responses instead of redirects/back()
 * - GCash pending-payment state lives in Cache (keyed by source id), not the
 *   session, since bearer-token requests are stateless
 */
class DonationController extends Controller
{
    private const ONLINE_GATEWAYS = ['paystack', 'flutterwave', 'mpesa', 'gcash', 'pix', 'telebirr', 'stripe'];

    private const ENV_PUBLIC_KEYS = [
        'paystack'    => 'PAYSTACK_PUBLIC_KEY',
        'flutterwave' => 'FLUTTERWAVE_PUBLIC_KEY',
        'stripe'      => 'STRIPE_PUBLIC_KEY',
        'gcash'       => 'GCASH_PUBLIC_KEY',
    ];

    private function churchPayaccounts(int $churchId): array
    {
        return Payaccount::with('paymentgateway')
            ->where('church_id', $churchId)
            ->where('status', 1)
            ->get()
            ->map(function ($pa) {
                $name   = $pa->paymentgateway->gatewayname ?? '';
                $online = in_array($name, self::ONLINE_GATEWAYS);

                if ($online) {
                    $dbKey  = $pa->param1 ?? '';
                    $envKey = isset(self::ENV_PUBLIC_KEYS[$name]) ? env(self::ENV_PUBLIC_KEYS[$name], '') : '';
                    $pubKey = $dbKey ?: $envKey;

                    $defaultCurrency = match ($name) {
                        'mpesa'       => 'KES',
                        'flutterwave', 'paystack' => 'NGN',
                        'stripe'      => 'USD',
                        'gcash'       => 'PHP',
                        default       => 'USD',
                    };

                    $currency = $pa->param5 ?: Paymentgateway::getCurrency($name, $defaultCurrency);
                } else {
                    $pubKey   = null;
                    $currency = null;
                }

                return [
                    'id'           => $pa->id,
                    'gatewayname'  => $name,
                    'display_name' => $pa->paymentgateway->displayname ?? $name,
                    'instructions' => $pa->paymentgateway->instructions ?? '',
                    'public_key'   => $pubKey,
                    'currency'     => $currency,
                    'is_online'    => $online,
                ];
            })
            ->toArray();
    }

    /** GET /v1/donate/gateways — active payaccounts for this church. */
    public function gateways(Request $request)
    {
        return response()->json($this->churchPayaccounts($request->user()->church_id));
    }

    /** GET /v1/donate/history — the authenticated member's donation history. */
    public function history(Request $request)
    {
        $donations = Donation::where('user_id', $request->user()->id)
            ->where('church_id', $request->user()->church_id)
            ->latest()
            ->get(['id', 'amount', 'currency', 'category', 'method', 'status', 'note', 'donated_at']);

        return response()->json(['data' => $donations]);
    }

    /** GET /v1/donate/status/{id} — poll a donation's current status (e.g. M-Pesa STK). */
    public function status(Request $request, $id)
    {
        $donation = Donation::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->where('church_id', $request->user()->church_id)
            ->first(['id', 'status', 'amount', 'currency']);

        if (!$donation) {
            return response()->json(['error' => 'Donation not found.'], 404);
        }

        return response()->json($donation);
    }

    /** Offline donation (cash, bank transfer). */
    public function store(Request $request)
    {
        $request->validate([
            'amount'        => 'required|numeric|min:1',
            'payaccount_id' => 'nullable|integer',
            'category'      => 'nullable|string|max:50',
            'note'          => 'nullable|string|max:500',
        ]);

        try {
            $method = 'cash';
            if ($request->payaccount_id) {
                $pa     = Payaccount::with('paymentgateway')->find($request->payaccount_id);
                $method = optional(optional($pa)->paymentgateway)->gatewayname ?? 'cash';
            }

            $donation = Donation::create([
                'church_id'  => $request->user()->church_id,
                'user_id'    => $request->user()->id,
                'amount'     => $request->amount,
                'currency'   => 'USD',
                'category'   => $request->category ?? 'offering',
                'method'     => $method,
                'status'     => 'pending',
                'note'       => $request->note,
                'uuid'       => uniqid(),
                'donated_at' => now(),
            ]);

            return response()->json([
                'success'    => true,
                'message'    => 'Donation submitted! Thank you for your generosity.',
                'donation_id' => $donation->id,
            ]);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => 'Something went wrong. Please try again.'], 500);
        }
    }

    /** Verify Paystack / Flutterwave / Stripe reference after JS popup success. */
    public function verify(Request $request)
    {
        $request->validate([
            'gateway'       => 'required|string',
            'reference'     => 'required|string',
            'payaccount_id' => 'required|integer',
            'amount'        => 'required|numeric|min:1',
            'category'      => 'nullable|string|max:50',
            'note'          => 'nullable|string|max:500',
        ]);

        $payaccount = Payaccount::where('id', $request->payaccount_id)
            ->where('church_id', $request->user()->church_id)
            ->where('status', 1)
            ->first();

        if (!$payaccount) {
            return response()->json(['error' => 'Invalid payment account.'], 422);
        }

        $verified = false;

        try {
            switch ($request->gateway) {
                case 'paystack':
                    $svc      = new PaystackService($payaccount->param2 ?? '', $payaccount->param1 ?? '');
                    $result   = $svc->verify($request->reference);
                    $verified = $svc->isSuccessful($result);
                    break;

                case 'flutterwave':
                    $svc      = new FlutterwaveService($payaccount->param2 ?? '');
                    $result   = $svc->verify($request->reference);
                    $verified = $svc->isSuccessful($result);
                    break;

                case 'stripe':
                    $secretKey = $payaccount->param2 ?: config('paymentgateway.stripe.secret_key', '');
                    $svc       = new StripeService($secretKey);
                    $result    = $svc->verify($request->reference);
                    $verified  = $svc->isSuccessful($result);
                    break;

                default:
                    $verified = false;
            }
        } catch (Exception $e) {
            Log::error('Payment verify error: ' . $e->getMessage());
        }

        if (!$verified) {
            return response()->json(['error' => 'Payment verification failed. Please contact support.'], 422);
        }

        $donation = Donation::create([
            'church_id'   => $request->user()->church_id,
            'user_id'     => $request->user()->id,
            'amount'      => $request->amount,
            'currency'    => 'USD',
            'category'    => $request->category ?? 'offering',
            'method'      => $request->gateway,
            'gateway_ref' => $request->reference,
            'status'      => 'completed',
            'note'        => $request->note,
            'uuid'        => uniqid(),
            'donated_at'  => now(),
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'Donation successful! Thank you for your generosity.',
            'donation_id' => $donation->id,
        ]);
    }

    /** M-Pesa STK push — returns JSON with a donation id to poll for completion. */
    public function mpesaStk(Request $request)
    {
        $request->validate([
            'phone'         => 'required|string',
            'amount'        => 'required|numeric|min:1',
            'payaccount_id' => 'required|integer',
            'category'      => 'nullable|string|max:50',
            'note'          => 'nullable|string|max:500',
        ]);

        $payaccount = Payaccount::where('id', $request->payaccount_id)
            ->where('church_id', $request->user()->church_id)
            ->where('status', 1)
            ->first();

        if (!$payaccount) {
            return response()->json(['error' => 'Invalid payment account.'], 422);
        }

        try {
            $svc   = new MpesaService($payaccount->param1 ?? '', $payaccount->param2 ?? '', $payaccount->param3 ?? '', $payaccount->param4 ?? '');
            $phone = $svc->formatPhone($request->phone);
            $ref   = 'DON-' . strtoupper(uniqid());

            $result = $svc->stkPush($phone, $request->amount, $ref, route('donate.mpesa-callback'));

            if (!empty($result['CheckoutRequestID'])) {
                $donation = Donation::create([
                    'church_id'   => $request->user()->church_id,
                    'user_id'     => $request->user()->id,
                    'amount'      => $request->amount,
                    'currency'    => 'KES',
                    'category'    => $request->category ?? 'offering',
                    'method'      => 'mpesa',
                    'gateway_ref' => $result['CheckoutRequestID'],
                    'status'      => 'pending',
                    'note'        => $request->note,
                    'uuid'        => $ref,
                    'donated_at'  => now(),
                ]);

                return response()->json([
                    'success'             => true,
                    'message'             => 'STK push sent. Enter your M-Pesa PIN to complete.',
                    'checkout_request_id' => $result['CheckoutRequestID'],
                    'donation_id'         => $donation->id,
                ]);
            }

            Log::error('M-Pesa STK no CheckoutRequestID', ['result' => $result]);
            $apiMsg = $result['errorMessage'] ?? ($result['ResultDesc'] ?? null);
            return response()->json(['error' => $apiMsg ?: 'Failed to initiate M-Pesa payment. Check your credentials.'], 422);
        } catch (Exception $e) {
            Log::error('M-Pesa STK error: ' . $e->getMessage());
            return response()->json(['error' => 'M-Pesa service unavailable. Try again later.'], 500);
        }
    }

    /** Create a GCash source via PayMongo and return the checkout URL. */
    public function gcashInit(Request $request)
    {
        $request->validate([
            'amount'        => 'required|numeric|min:1',
            'payaccount_id' => 'required|integer',
            'category'      => 'nullable|string|max:50',
            'note'          => 'nullable|string|max:500',
        ]);

        $payaccount = Payaccount::where('id', $request->payaccount_id)
            ->where('church_id', $request->user()->church_id)
            ->where('status', 1)
            ->first();

        if (!$payaccount) {
            return response()->json(['error' => 'Invalid payment account.'], 422);
        }

        try {
            $gcashCurrency = Paymentgateway::getCurrency('gcash', 'PHP');
            $secretKey = $payaccount->param2 ?: config('paymentgateway.gcash.secret_key', '');
            $currency  = $payaccount->param5 ?: $gcashCurrency;
            $svc       = new GCashService($secretKey, $currency);
            $desc      = 'Church Donation — ' . ($request->category ?? 'offering');

            $frontend   = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
            $successUrl = $frontend . '/member/give/gcash-return?status=success';
            $failedUrl  = $frontend . '/member/give/gcash-return?status=failed';

            $result   = $svc->createSource((float) $request->amount, $successUrl, $failedUrl, $desc);
            $sourceId = $result['source_id'];

            // Pending-payment state keyed by source id — the Next.js return
            // page POSTs this id back to gcashConfirm() once PayMongo redirects.
            Cache::put("gcash:{$sourceId}", [
                'user_id'       => $request->user()->id,
                'church_id'     => $request->user()->church_id,
                'payaccount_id' => $payaccount->id,
                'amount'        => $request->amount,
                'category'      => $request->category ?? 'offering',
                'note'          => $request->note ?? '',
                'currency'      => $currency,
            ], now()->addHour());

            return response()->json(['checkout_url' => $result['checkout_url']]);
        } catch (Exception $e) {
            Log::error('GCash init error: ' . $e->getMessage());
            return response()->json(['error' => 'GCash service unavailable. Please try again.'], 500);
        }
    }

    /** Confirm a GCash payment after the Next.js return page gets the redirect from PayMongo. */
    public function gcashConfirm(Request $request)
    {
        $request->validate(['source_id' => 'required|string']);

        $sourceId = $request->source_id;
        $pending  = Cache::get("gcash:{$sourceId}");

        if (!$pending || $pending['user_id'] !== $request->user()->id) {
            return response()->json(['error' => 'Invalid or expired payment session.'], 422);
        }

        $payaccount = Payaccount::where('id', $pending['payaccount_id'])
            ->where('church_id', $pending['church_id'])
            ->where('status', 1)
            ->first();

        if (!$payaccount) {
            return response()->json(['error' => 'Invalid payment account.'], 422);
        }

        try {
            $secretKey = $payaccount->param2 ?: config('paymentgateway.gcash.secret_key', '');
            $svc       = new GCashService($secretKey, $pending['currency']);

            $source = $svc->getSource($sourceId);

            if (!$svc->isChargeable($source)) {
                return response()->json(['error' => 'GCash payment not completed. Please try again.'], 422);
            }

            $desc    = 'Church Donation — ' . $pending['category'];
            $payment = $svc->createPayment($sourceId, (float) $pending['amount'], $desc);

            Cache::forget("gcash:{$sourceId}");

            $donation = Donation::create([
                'church_id'   => $pending['church_id'],
                'user_id'     => $pending['user_id'],
                'amount'      => $pending['amount'],
                'currency'    => $pending['currency'],
                'category'    => $pending['category'],
                'method'      => 'gcash',
                'gateway_ref' => $payment['id'] ?? $sourceId,
                'status'      => 'completed',
                'note'        => $pending['note'],
                'uuid'        => uniqid(),
                'donated_at'  => now(),
            ]);

            return response()->json([
                'success'     => true,
                'message'     => 'GCash donation successful! Thank you for your generosity.',
                'donation_id' => $donation->id,
            ]);
        } catch (Exception $e) {
            Log::error('GCash confirm error: ' . $e->getMessage());
            return response()->json(['error' => 'Payment verification failed. Please contact support.'], 500);
        }
    }

    /** Create a Stripe PaymentIntent and return the client_secret. */
    public function stripeIntent(Request $request)
    {
        $request->validate([
            'amount'        => 'required|numeric|min:1',
            'payaccount_id' => 'required|integer',
            'category'      => 'nullable|string|max:50',
        ]);

        $payaccount = Payaccount::where('id', $request->payaccount_id)
            ->where('church_id', $request->user()->church_id)
            ->where('status', 1)
            ->first();

        if (!$payaccount) {
            return response()->json(['error' => 'Invalid payment account.'], 422);
        }

        $stripeCurrency = Paymentgateway::getCurrency('stripe', 'USD');

        try {
            $secretKey = $payaccount->param2 ?: config('paymentgateway.stripe.secret_key', '');
            $publicKey = $payaccount->param1 ?: config('paymentgateway.stripe.public_key', '');
            $currency  = $payaccount->param5 ?: $stripeCurrency;
            $svc       = new StripeService($secretKey, $publicKey, $currency);
            $desc      = 'Church Donation — ' . ($request->category ?? 'offering');
            $result    = $svc->createIntent((float) $request->amount, $desc);

            return response()->json($result);
        } catch (Exception $e) {
            Log::error('Stripe intent error: ' . $e->getMessage());
            return response()->json(['error' => 'Stripe service unavailable. Please try again.'], 500);
        }
    }
}
