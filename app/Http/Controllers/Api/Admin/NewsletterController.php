<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterMail;
use App\Models\NewsLetter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * Newsletter send for the Next.js admin console (/console/newsletter).
 * Mirrors app/Http/Controllers/Admin/NewsLetterController@store: `to` picks
 * the recipient group by newsletter status (1 = subscribed, 0 = unsubscribed),
 * and delivery is queued per-recipient.
 */
class NewsletterController extends Controller
{
    public function index(Request $request)
    {
        $church_id = $request->user()->church_id;

        return response()->json([
            'subscribed'   => NewsLetter::where([['church_id', $church_id], ['status', 1]])->count(),
            'unsubscribed' => NewsLetter::where([['church_id', $church_id], ['status', 0]])->count(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'to'      => 'required|in:0,1',
        ]);

        $recipients = NewsLetter::where([
            ['church_id', $request->user()->church_id],
            ['status', (int) $data['to']],
        ])->get();

        if ($recipients->isEmpty()) {
            return response()->json(['message' => 'No recipients in the selected group.'], 422);
        }

        foreach ($recipients as $recipient) {
            Mail::to($recipient->email)->queue(new NewsletterMail($data['subject'], $data['message']));
        }

        return response()->json([
            'success' => true,
            'sent'    => $recipients->count(),
            'message' => "Newsletter queued for {$recipients->count()} recipient(s).",
        ]);
    }
}
