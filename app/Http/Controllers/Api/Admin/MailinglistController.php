<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailingList;
use App\Models\MailinglistSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Mailing lists CRUD for the Next.js admin console
 * (/console/email-blaster/mailing-lists). Mirrors
 * app/Http/Controllers/Admin/MailinglistController's core CRUD (list
 * creation/edit/delete) — the CSV-import and attach-subscriber-by-picker
 * flows are covered by SubscriberController::attach() instead of
 * replicating the legacy two-step AttachSubscriberController dance.
 */
class MailinglistController extends Controller
{
    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = MailingList::where('church_id', $churchId)->withCount('subscribers');

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $lists = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($lists->items())->map(fn (MailingList $l) => $this->summarize($l)),
            'meta' => [
                'current_page' => $lists->currentPage(),
                'last_page'    => $lists->lastPage(),
                'total'        => $lists->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $list = $this->findList($request, $id);

        if (! $list) {
            return response()->json(['message' => 'Mailing list not found'], 404);
        }

        return response()->json($this->summarize($list));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255|unique:mailinglists,name',
            'description'  => 'nullable|string',
            'scope'        => 'required|in:subscription,campaign,segment',
            'is_published' => 'nullable|boolean',
        ]);

        $list = MailingList::create([
            ...$data,
            'church_id'    => $request->user()->church_id,
            'is_published' => $request->boolean('is_published', true),
            'slug'         => Str::slug($data['name']) . '-' . uniqid(),
        ]);

        return response()->json(['success' => true, 'id' => $list->id], 201);
    }

    public function update(Request $request, $id)
    {
        $list = $this->findList($request, $id);

        if (! $list) {
            return response()->json(['message' => 'Mailing list not found'], 404);
        }

        $data = $request->validate([
            'name'         => ['sometimes', 'required', 'string', 'max:255', Rule::unique('mailinglists', 'name')->ignore($id)],
            'description'  => 'nullable|string',
            'scope'        => 'sometimes|required|in:subscription,campaign,segment',
            'is_published' => 'nullable|boolean',
        ]);

        $list->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $list = $this->findList($request, $id);

        if (! $list) {
            return response()->json(['message' => 'Mailing list not found'], 404);
        }

        $list->delete();

        return response()->json(['success' => true]);
    }

    public function subscribers(Request $request, $id)
    {
        $list = $this->findList($request, $id);

        if (! $list) {
            return response()->json(['message' => 'Mailing list not found'], 404);
        }

        $links = MailinglistSubscriber::with('subscriber')->where('mailing_list_id', $id)->get();

        return response()->json($links->map(fn (MailinglistSubscriber $link) => [
            'link_id' => $link->id,
            'email'   => optional($link->subscriber)->email,
            'name'    => trim((optional($link->subscriber)->firstname ?? '') . ' ' . (optional($link->subscriber)->lastname ?? '')),
        ]));
    }

    private function findList(Request $request, $id): ?MailingList
    {
        return MailingList::where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(MailingList $l): array
    {
        return [
            'id'              => $l->id,
            'name'            => $l->name,
            'description'     => $l->description,
            'scope'           => $l->scope,
            'is_published'    => (bool) $l->is_published,
            'subscriber_count' => $l->subscribers_count ?? null,
        ];
    }
}
