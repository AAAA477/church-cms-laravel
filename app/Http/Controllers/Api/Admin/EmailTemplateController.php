<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Email;
use Illuminate\Http\Request;

/**
 * Email templates CRUD for the Next.js admin console (/console/emails).
 * Mirrors app/Http/Controllers/Admin/EmailController (the Email Blaster's
 * reusable subject/from/content templates, referenced by campaigns).
 */
class EmailTemplateController extends Controller
{
    private function rules(): array
    {
        return [
            'subject'        => 'required|string|max:255',
            'from_email'     => 'required|email|max:255',
            'from_name'      => 'required|string|max:255',
            'reply_to_email' => 'required|email|max:255',
            'content'        => 'required|string',
        ];
    }

    public function index(Request $request)
    {
        $emails = Email::where('church_id', $request->user()->church_id)->orderByDesc('id')->get();

        return response()->json($emails->map(fn (Email $e) => [
            'id'         => $e->id,
            'subject'    => $e->subject,
            'from_email' => $e->from_email,
            'from_name'  => $e->from_name,
            'created_at' => optional($e->created_at)->toDateTimeString(),
        ]));
    }

    public function show(Request $request, $id)
    {
        $email = Email::where('church_id', $request->user()->church_id)->find($id);

        if (! $email) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        return response()->json([
            'id'             => $email->id,
            'subject'        => $email->subject,
            'from_email'     => $email->from_email,
            'from_name'      => $email->from_name,
            'reply_to_email' => $email->reply_to_email,
            'content'        => $email->content,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $email = new Email;
        $email->church_id      = $request->user()->church_id;
        $email->subject        = $data['subject'];
        $email->from_email     = $data['from_email'];
        $email->from_name      = $data['from_name'];
        $email->reply_to_email = $data['reply_to_email'];
        $email->content        = $data['content'];
        $email->save();

        return response()->json(['success' => true, 'id' => $email->id], 201);
    }

    public function update(Request $request, $id)
    {
        $email = Email::where('church_id', $request->user()->church_id)->find($id);

        if (! $email) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        $data = $request->validate($this->rules());

        $email->subject        = $data['subject'];
        $email->from_email     = $data['from_email'];
        $email->from_name      = $data['from_name'];
        $email->reply_to_email = $data['reply_to_email'];
        $email->content        = $data['content'];
        $email->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $email = Email::where('church_id', $request->user()->church_id)->find($id);

        if (! $email) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        $email->delete();

        return response()->json(['success' => true]);
    }
}
