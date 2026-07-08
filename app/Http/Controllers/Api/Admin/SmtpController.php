<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Smtp;
use Illuminate\Http\Request;

/**
 * SMTP server configs CRUD for the Next.js admin console (/console/smtps).
 * Mirrors app/Http/Controllers/Admin/SmtpController.
 */
class SmtpController extends Controller
{
    private function rules(): array
    {
        return [
            'host'       => 'required|string|max:255',
            'port'       => 'required|integer|between:1,65535',
            'username'   => 'required|string|max:255',
            'password'   => 'required|string|max:255',
            'encryption' => 'required|in:tls,ssl,none',
            'status'     => 'required|boolean',
        ];
    }

    public function index(Request $request)
    {
        $smtps = Smtp::where('church_id', $request->user()->church_id)->orderByDesc('id')->get();

        return response()->json($smtps->map(fn (Smtp $s) => [
            'id'         => $s->id,
            'host'       => $s->host,
            'port'       => $s->port,
            'username'   => $s->username,
            'encryption' => $s->encryption,
            'status'     => (bool) $s->status,
        ]));
    }

    public function show(Request $request, $id)
    {
        $smtp = Smtp::where('church_id', $request->user()->church_id)->find($id);

        if (! $smtp) {
            return response()->json(['message' => 'SMTP config not found'], 404);
        }

        return response()->json([
            'id'         => $smtp->id,
            'host'       => $smtp->host,
            'port'       => $smtp->port,
            'username'   => $smtp->username,
            'password'   => $smtp->password,
            'encryption' => $smtp->encryption,
            'status'     => (bool) $smtp->status,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $smtp = new Smtp;
        $smtp->church_id  = $request->user()->church_id;
        $smtp->fill($data);
        $smtp->status = $request->boolean('status');
        $smtp->save();

        return response()->json(['success' => true, 'id' => $smtp->id], 201);
    }

    public function update(Request $request, $id)
    {
        $smtp = Smtp::where('church_id', $request->user()->church_id)->find($id);

        if (! $smtp) {
            return response()->json(['message' => 'SMTP config not found'], 404);
        }

        $data = $request->validate($this->rules());
        $smtp->fill($data);
        $smtp->status = $request->boolean('status');
        $smtp->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $smtp = Smtp::where('church_id', $request->user()->church_id)->find($id);

        if (! $smtp) {
            return response()->json(['message' => 'SMTP config not found'], 404);
        }

        $smtp->delete();

        return response()->json(['success' => true]);
    }
}
