<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailQueue;
use Illuminate\Http\Request;

/**
 * Mail queue monitor for the Next.js admin console (/console/mailqueues
 * and /console/mails-delivered). Mirrors app/Http/Controllers/Admin/
 * MailQueueController plus EmailBlaster\MailsDeliveredController — the
 * "delivered" view is the same table filtered to fired_at != null, so a
 * single controller with a `delivered=1` query flag covers both.
 */
class MailQueueController extends Controller
{
    public function index(Request $request)
    {
        $query = MailQueue::ByChurch($request->user()->church_id)->orderByDesc('id');

        if ($request->boolean('delivered')) {
            $query->whereNotNull('fired_at');
        }

        $mails = $query->paginate(25)->withQueryString();

        return response()->json([
            'data' => collect($mails->items())->map(fn (MailQueue $m) => [
                'id'         => $m->id,
                'to_mail'    => $m->to_mail,
                'subject'    => $m->subject,
                'from_email' => $m->from_email,
                'status'     => $m->status,
                'scheduled_at' => optional($m->scheduled_at)->toDateTimeString(),
                'fired_at'     => optional($m->fired_at)->toDateTimeString(),
            ]),
            'meta' => [
                'current_page' => $mails->currentPage(),
                'last_page'    => $mails->lastPage(),
                'total'        => $mails->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $mail = MailQueue::ByChurch($request->user()->church_id)->where('mail_queues.id', $id)->first();

        if (! $mail) {
            return response()->json(['message' => 'Queued mail not found'], 404);
        }

        return response()->json([
            'id'             => $mail->id,
            'to_mail'        => $mail->to_mail,
            'subject'        => $mail->subject,
            'from_email'     => $mail->from_email,
            'from_name'      => $mail->from_name,
            'reply_to_email' => $mail->reply_to_email,
            'content'        => $mail->content,
            'status'         => $mail->status,
            'clicks'         => $mail->clicks,
            'is_read'        => (bool) $mail->is_read,
            'scheduled_at'   => optional($mail->scheduled_at)->toDateTimeString(),
            'fired_at'       => optional($mail->fired_at)->toDateTimeString(),
        ]);
    }

    /** Legacy update only sets fired_at (see Admin\MailQueueController@update + mailqueue/Edit.vue). */
    public function update(Request $request, $id)
    {
        $mail = MailQueue::ByChurch($request->user()->church_id)->where('mail_queues.id', $id)->first();

        if (! $mail) {
            return response()->json(['message' => 'Queued mail not found'], 404);
        }

        $data = $request->validate(['fired_at' => 'required|date']);
        $mail->fired_at = $data['fired_at'];
        $mail->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $mail = MailQueue::ByChurch($request->user()->church_id)->where('mail_queues.id', $id)->first();

        if (! $mail) {
            return response()->json(['message' => 'Queued mail not found'], 404);
        }

        $mail->delete();

        return response()->json(['success' => true]);
    }
}
