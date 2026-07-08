<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\MailingList;
use Illuminate\Http\Request;

/**
 * Email campaigns CRUD for the Next.js admin console
 * (/console/email-blaster/campaigns). Mirrors app/Http/Controllers/Admin/
 * CampaignController's core CRUD — the CampaignEmail sub-resource (attaching
 * individual email templates to a campaign) and send/delivery-tracking are
 * deferred; this covers campaign definition (name/description/mailing
 * list/status) only.
 */
class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Campaign::with('mailinglist')->where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $campaigns = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($campaigns->items())->map(fn (Campaign $c) => $this->summarize($c)),
            'meta' => [
                'current_page' => $campaigns->currentPage(),
                'last_page'    => $campaigns->lastPage(),
                'total'        => $campaigns->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $campaign = $this->findCampaign($request, $id);

        if (! $campaign) {
            return response()->json(['message' => 'Campaign not found'], 404);
        }

        return response()->json($this->summarize($campaign));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'status'         => 'nullable|boolean',
            'mailinglist_id' => 'nullable|integer|exists:mailinglists,id',
        ]);

        $campaign = Campaign::create([...$data, 'church_id' => $request->user()->church_id]);

        return response()->json(['success' => true, 'id' => $campaign->id], 201);
    }

    public function update(Request $request, $id)
    {
        $campaign = $this->findCampaign($request, $id);

        if (! $campaign) {
            return response()->json(['message' => 'Campaign not found'], 404);
        }

        $data = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'description'    => 'nullable|string',
            'status'         => 'nullable|boolean',
            'mailinglist_id' => 'nullable|integer|exists:mailinglists,id',
        ]);

        $campaign->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $campaign = $this->findCampaign($request, $id);

        if (! $campaign) {
            return response()->json(['message' => 'Campaign not found'], 404);
        }

        $campaign->delete();

        return response()->json(['success' => true]);
    }

    private function findCampaign(Request $request, $id): ?Campaign
    {
        return Campaign::with('mailinglist')->where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Campaign $c): array
    {
        return [
            'id'              => $c->id,
            'name'            => $c->name,
            'description'     => $c->description,
            'status'          => (bool) $c->status,
            'mailinglist_id'  => $c->mailinglist_id,
            'mailinglist_name' => optional($c->mailinglist)->name,
        ];
    }
}
