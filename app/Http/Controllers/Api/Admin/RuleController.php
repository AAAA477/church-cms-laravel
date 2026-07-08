<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\GetResponse;
use Illuminate\Http\Request;

/**
 * Email Blaster automation rules CRUD for the Next.js admin console
 * (/console/rules). Mirrors app/Http/Controllers/Admin/EmailBlaster/
 * RulesController — a rule watches a campaign and, after `day_after` days,
 * moves openers / non-openers into follow-up campaigns.
 */
class RuleController extends Controller
{
    private function rules(): array
    {
        return [
            'name'                      => 'required|string|max:255',
            'campaign_id'               => 'required|integer|exists:campaigns,id',
            'email_open_campaign_id'    => 'nullable|integer|exists:campaigns,id',
            'no_email_open_campaign_id' => 'nullable|integer|exists:campaigns,id',
            'day_after'                 => 'required|integer|min:1',
            'status'                    => 'required|boolean',
        ];
    }

    public function index(Request $request)
    {
        $rules = GetResponse::with('campaign')
            ->where('church_id', $request->user()->church_id)
            ->orderByDesc('id')
            ->get();

        return response()->json($rules->map(fn (GetResponse $r) => [
            'id'            => $r->id,
            'name'          => $r->name,
            'campaign'      => optional($r->campaign)->name,
            'campaign_id'   => $r->campaign_id,
            'email_open_campaign_id'    => $r->email_open_campaign_id,
            'no_email_open_campaign_id' => $r->no_email_open_campaign_id,
            'day_after'     => $r->day_after,
            'status'        => (bool) $r->status,
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $rule = GetResponse::create([...$data, 'church_id' => $request->user()->church_id]);

        return response()->json(['success' => true, 'id' => $rule->id], 201);
    }

    public function update(Request $request, $id)
    {
        $rule = GetResponse::where('church_id', $request->user()->church_id)->find($id);

        if (! $rule) {
            return response()->json(['message' => 'Rule not found'], 404);
        }

        $data = $request->validate($this->rules());
        $rule->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $rule = GetResponse::where('church_id', $request->user()->church_id)->find($id);

        if (! $rule) {
            return response()->json(['message' => 'Rule not found'], 404);
        }

        $rule->delete();

        return response()->json(['success' => true]);
    }
}
