<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SendMail;
use App\Models\User;
use App\Traits\SendMessageProcess;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Direct/bulk member messaging for the Next.js admin console
 * (/console/messages). Mirrors app/Http/Controllers/Admin/
 * SendMessageController — `memberstore()`'s `SendMessageAllEvent` is fired
 * synchronously by app/Listeners/SendMessageAllEventListener (no queue),
 * so this controller just calls the same `SendMessageProcess::sendMessage()`
 * trait method directly in a loop over the selected recipients, same
 * pattern already used for group messaging in Api\Admin\GroupController.
 */
class MessageController extends Controller
{
    use SendMessageProcess;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $batchIds = SendMail::selectRaw('MAX(id) as id, batch_id')
            ->where('church_id', $churchId)
            ->whereNull('entity_id')
            ->whereNull('entity_name')
            ->groupBy('batch_id')
            ->orderByDesc('id')
            ->paginate(20);

        $latestPerBatch = SendMail::whereIn('id', collect($batchIds->items())->pluck('id'))->get()->keyBy('id');

        return response()->json([
            'data' => collect($batchIds->items())->map(function ($row) use ($latestPerBatch) {
                $mail = $latestPerBatch->get($row->id);
                $recipientCount = SendMail::where('batch_id', $row->batch_id)->count();

                return [
                    'batch_id'   => $row->batch_id,
                    'subject'    => $mail?->subject,
                    'message'    => $mail?->message,
                    'mode'       => $mail?->mode,
                    'recipients' => $recipientCount,
                    'sent_at'    => $mail?->executed_at,
                ];
            }),
            'meta' => [
                'current_page' => $batchIds->currentPage(),
                'last_page'    => $batchIds->lastPage(),
                'total'        => $batchIds->total(),
            ],
        ]);
    }

    public function show(Request $request, $batchId)
    {
        $messages = SendMail::where('church_id', $request->user()->church_id)
            ->where('batch_id', $batchId)
            ->with('user')
            ->orderByDesc('executed_at')
            ->get();

        if ($messages->isEmpty()) {
            return response()->json(['message' => 'Batch not found'], 404);
        }

        return response()->json($messages->map(fn (SendMail $m) => [
            'id'      => $m->id,
            'to'      => optional($m->user)->name,
            'mode'    => $m->mode,
            'subject' => $m->subject,
            'message' => $m->message,
            'sent_at' => $m->executed_at,
        ]));
    }

    public function recipients(Request $request)
    {
        $churchId = $request->user()->church_id;
        $membershipType = $request->query('membership_type', 'member');

        $query = User::where('church_id', $churchId)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', fn ($p) => $p->where('membership_type', $membershipType)->where('status', 'active'))
            ->with('userprofile');

        if ($search = $request->query('search')) {
            $query->whereHas('userprofile', function ($p) use ($search) {
                $p->where('firstname', 'like', "%{$search}%")->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        $users = $query->limit(50)->get();

        return response()->json($users->map(fn (User $u) => [
            'id'   => $u->id,
            'name' => trim((optional($u->userprofile)->firstname ?? '') . ' ' . (optional($u->userprofile)->lastname ?? '')) ?: $u->name,
        ]));
    }

    public function send(Request $request)
    {
        $data = (object) $request->validate([
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'integer',
            'mode'       => 'required|in:mail,sms,notification',
            'subject'    => 'required_if:mode,mail|nullable|string|max:30',
            'message'    => 'required|string|max:1000',
        ]);
        $data->entity_id = null;
        $data->entity_name = null;
        $data->attachments = null;
        $data->executed_at = null;

        $churchId = $request->user()->church_id;
        $batchId = (string) Str::uuid();
        $sent = 0;

        foreach ($data->user_ids as $userId) {
            $user = User::where('church_id', $churchId)->find($userId);
            if (! $user) {
                continue;
            }

            $this->sendMessage($data, $churchId, $request->user()->email, $user, $request->user(), $batchId);
            $sent++;
        }

        return response()->json(['success' => true, 'sent' => $sent]);
    }
}
