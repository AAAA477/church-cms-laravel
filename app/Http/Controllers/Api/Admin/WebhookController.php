<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailingList;
use App\Models\Webhook;
use Illuminate\Http\Request;

/**
 * Email Blaster webhooks CRUD for the Next.js admin console
 * (/console/webhooks). Mirrors app/Http/Controllers/Admin/EmailBlaster/
 * WebhooksController — inbound endpoints keyed to a mailing list, secured
 * by a handshake key. Church scoping rides through the mailing list
 * (Webhook::ByChurch), since webhooks has no church_id column.
 */
class WebhookController extends Controller
{
    private function rules(int $church_id): array
    {
        return [
            'name'           => 'required|string|max:255',
            'verb'           => 'required|in:GET,POST,PUT,DELETE',
            'url'            => 'required|url|max:2048',
            'mailinglist_id' => [
                'required', 'integer',
                function ($attribute, $value, $fail) use ($church_id) {
                    if (! MailingList::where([['id', $value], ['church_id', $church_id]])->exists()) {
                        $fail('The selected mailing list is invalid.');
                    }
                },
            ],
            'handshake_key'  => 'nullable|string|max:255',
            'status'         => 'required|boolean',
        ];
    }

    public function index(Request $request)
    {
        $webhooks = Webhook::with('mailinglist')
            ->ByChurch($request->user()->church_id)
            ->orderByDesc('id')
            ->get();

        return response()->json($webhooks->map(fn (Webhook $w) => [
            'id'             => $w->id,
            'name'           => $w->name,
            'verb'           => $w->verb,
            'url'            => $w->url,
            'mailinglist'    => optional($w->mailinglist)->name,
            'mailinglist_id' => $w->mailinglist_id,
            'handshake_key'  => $w->handshake_key,
            'status'         => (bool) $w->status,
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules($request->user()->church_id));

        $webhook = Webhook::create($data);

        return response()->json(['success' => true, 'id' => $webhook->id], 201);
    }

    public function update(Request $request, $id)
    {
        $webhook = Webhook::ByChurch($request->user()->church_id)->find($id);

        if (! $webhook) {
            return response()->json(['message' => 'Webhook not found'], 404);
        }

        $data = $request->validate($this->rules($request->user()->church_id));
        $webhook->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $webhook = Webhook::ByChurch($request->user()->church_id)->find($id);

        if (! $webhook) {
            return response()->json(['message' => 'Webhook not found'], 404);
        }

        $webhook->delete();

        return response()->json(['success' => true]);
    }
}
