<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\FeedbackMessage;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Feedback threads for the Next.js admin console (/console/feedbacks).
 * Mirrors app/Http/Controllers/Admin/FeedbackController.
 */
class FeedbackController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $feedbacks = Feedback::where('church_id', $churchId)
            ->with(['user', 'feedbackMessage'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => collect($feedbacks->items())->map(fn (Feedback $f) => [
                'id'           => $f->id,
                'user'         => optional($f->user)->name,
                'status'       => (bool) $f->status,
                'message_count' => $f->feedbackMessage->count(),
                'created_at'   => $f->created_at,
            ]),
            'meta' => [
                'current_page' => $feedbacks->currentPage(),
                'last_page'    => $feedbacks->lastPage(),
                'total'        => $feedbacks->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $feedback = Feedback::where('church_id', $request->user()->church_id)
            ->with('user')
            ->find($id);

        if (! $feedback) {
            return response()->json(['message' => 'Feedback not found'], 404);
        }

        $messages = FeedbackMessage::where('feedback_id', $id)->orderBy('created_at')->get();

        return response()->json([
            'id'       => $feedback->id,
            'user'     => optional($feedback->user)->name,
            'messages' => $messages->map(fn (FeedbackMessage $m) => [
                'id'         => $m->id,
                'message'    => $m->message,
                'category'   => $m->category,
                'is_seen'    => $m->is_seen,
                'created_at' => $m->created_at,
            ]),
        ]);
    }

    public function updateMessageStatus(Request $request, $id)
    {
        $message = FeedbackMessage::whereHas('feedback', fn ($q) => $q->where('church_id', $request->user()->church_id))
            ->find($id);

        if (! $message) {
            return response()->json(['message' => 'Feedback message not found'], 404);
        }

        $data = $request->validate(['status' => 'required|in:has_seen,action_taken']);

        $message->is_seen = $data['status'];
        $message->save();

        $this->doActivityLog(
            $message,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_UPDATE_FEEDBACK_STATUS,
            'Feedback Status Updated Successfully'
        );

        return response()->json(['success' => true]);
    }
}
