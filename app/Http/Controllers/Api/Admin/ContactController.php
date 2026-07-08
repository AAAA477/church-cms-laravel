<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

/**
 * Read-only contact form submissions for the Next.js admin console
 * (/console/contacts). Mirrors app/Http/Controllers/Admin/ContactController
 * — the legacy panel never supported editing or deleting a submission,
 * just viewing it, so this stays index/show only.
 */
class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::where('church_id', $request->user()->church_id);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('query', 'like', "%{$search}%");
            });
        }

        $contacts = $query->orderByDesc('date_of_submission')->paginate(15);

        return response()->json([
            'data' => collect($contacts->items())->map(fn (Contact $c) => $this->summarize($c)),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page'    => $contacts->lastPage(),
                'total'        => $contacts->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $contact = Contact::where('church_id', $request->user()->church_id)->find($id);

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        return response()->json($this->summarize($contact));
    }

    private function summarize(Contact $c): array
    {
        return [
            'id'                 => $c->id,
            'fullname'           => $c->fullname,
            'email'              => $c->email,
            'mobile'             => $c->mobile,
            'query'              => $c->query,
            'date_of_submission' => $c->date_of_submission,
        ];
    }
}
