<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bulletin;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Bulletins CRUD for the Next.js admin console (/console/bulletins).
 * Mirrors app/Http/Controllers/Admin/BulletinsController.
 */
class BulletinController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Bulletin::where('church_id', $churchId);

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $bulletins = $query->orderByDesc('year')->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($bulletins->items())->map(fn (Bulletin $b) => $this->summarize($b)),
            'meta' => [
                'current_page' => $bulletins->currentPage(),
                'last_page'    => $bulletins->lastPage(),
                'total'        => $bulletins->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $bulletin = $this->findBulletin($request, $id);

        if (! $bulletin) {
            return response()->json(['message' => 'Bulletin not found'], 404);
        }

        return response()->json($this->summarize($bulletin));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'type'  => 'required|in:week,month',
            'week'  => 'required_if:type,week|nullable|integer|min:1|max:53',
            'month' => 'required_if:type,month|nullable|integer|min:1|max:12',
            'year'  => 'required|integer|min:1950',
            'path'  => 'required|file|mimes:pdf',
        ]);

        $churchId = $request->user()->church_id;

        $bulletin = new Bulletin;
        $bulletin->church_id = $churchId;
        $bulletin->name = $data['name'];
        $bulletin->type = $data['type'];
        $bulletin->week = $data['type'] === 'week' ? $data['week'] : null;
        $bulletin->month = $data['type'] === 'month' ? $data['month'] : null;
        $bulletin->year = $data['year'];
        $bulletin->cover_image = $data['type'] === 'week' ? 'uploads/week.jpg' : 'uploads/month.jpg';
        $bulletin->path = $this->uploadFile("{$churchId}/bulletins", $request->file('path'));
        $bulletin->created_by = $request->user()->id;
        $bulletin->save();

        $this->doActivityLog(
            $bulletin,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_BULLETIN,
            'Bulletin Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $bulletin->id], 201);
    }

    public function destroy(Request $request, $id)
    {
        $bulletin = $this->findBulletin($request, $id);

        if (! $bulletin) {
            return response()->json(['message' => 'Bulletin not found'], 404);
        }

        $bulletin->delete();

        $this->doActivityLog(
            $bulletin,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_BULLETIN,
            'Bulletin Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    private function findBulletin(Request $request, $id): ?Bulletin
    {
        return Bulletin::where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Bulletin $b): array
    {
        return [
            'id'          => $b->id,
            'name'        => $b->name,
            'type'        => $b->type,
            'week'        => $b->week,
            'month'       => $b->month,
            'year'        => $b->year,
            'cover_image' => $b->CoverImagePath,
            'path'        => $b->FilePath,
        ];
    }
}
