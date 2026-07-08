<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailingList;
use App\Models\MailinglistSubscriber;
use App\Models\Subscribers;
use Illuminate\Http\Request;

/**
 * Email subscribers CRUD for the Next.js admin console
 * (/console/email-blaster/subscribers). Mirrors app/Http/Controllers/Admin/
 * SubscribersController's core CRUD, plus attach/detach to a mailing list
 * (replacing the legacy two-step AttachSubscriberController + CSV import
 * flow with a direct attach-by-id action).
 *
 * Note: `subscribers.email` has a global unique constraint (not scoped by
 * church_id) — a pre-existing schema quirk, not something introduced here.
 */
class SubscriberController extends Controller
{
    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Subscribers::where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        $subscribers = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($subscribers->items())->map(fn (Subscribers $s) => $this->summarize($s)),
            'meta' => [
                'current_page' => $subscribers->currentPage(),
                'last_page'    => $subscribers->lastPage(),
                'total'        => $subscribers->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email'     => 'required|email|unique:subscribers,email',
            'firstname' => 'nullable|string|max:255',
            'lastname'  => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $subscriber = Subscribers::create([
            ...$data,
            'church_id' => $request->user()->church_id,
            'source'    => 'admin',
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json(['success' => true, 'id' => $subscriber->id], 201);
    }

    public function destroy(Request $request, $id)
    {
        $subscriber = Subscribers::where('church_id', $request->user()->church_id)->find($id);

        if (! $subscriber) {
            return response()->json(['message' => 'Subscriber not found'], 404);
        }

        $subscriber->delete();

        return response()->json(['success' => true]);
    }

    public function attach(Request $request)
    {
        $data = $request->validate([
            'subscriber_id'    => 'required|integer|exists:subscribers,id',
            'mailing_list_id'  => 'required|integer|exists:mailinglists,id',
        ]);

        $list = MailingList::where('church_id', $request->user()->church_id)->find($data['mailing_list_id']);
        if (! $list) {
            return response()->json(['message' => 'Mailing list not found'], 404);
        }

        $exists = MailinglistSubscriber::where('mailing_list_id', $data['mailing_list_id'])
            ->where('subscribers_id', $data['subscriber_id'])
            ->exists();

        if (! $exists) {
            MailinglistSubscriber::create([
                'mailing_list_id' => $data['mailing_list_id'],
                'subscribers_id'  => $data['subscriber_id'],
                'status'          => 1,
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function detach(Request $request, $linkId)
    {
        $link = MailinglistSubscriber::find($linkId);

        if (! $link) {
            return response()->json(['message' => 'Link not found'], 404);
        }

        $link->delete();

        return response()->json(['success' => true]);
    }

    private function summarize(Subscribers $s): array
    {
        return [
            'id'        => $s->id,
            'email'     => $s->email,
            'firstname' => $s->firstname,
            'lastname'  => $s->lastname,
            'is_active' => (bool) $s->is_active,
            'source'    => $s->source,
        ];
    }
}
