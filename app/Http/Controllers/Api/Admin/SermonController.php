<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sermon;
use App\Models\SermonLink;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Sermons + sermon links (audio/video/pdf series entries) CRUD for the
 * Next.js admin console (/console/sermons). Mirrors
 * app/Http/Controllers/Admin/{SermonsController,SermonLinkController}.
 */
class SermonController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Sermon::where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $sermons = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($sermons->items())->map(fn (Sermon $s) => [
                'id'          => $s->id,
                'title'       => $s->title,
                'cover_image' => $s->CoverImagePath,
                'link_count'  => SermonLink::where('sermons_id', $s->id)->count(),
            ]),
            'meta' => [
                'current_page' => $sermons->currentPage(),
                'last_page'    => $sermons->lastPage(),
                'total'        => $sermons->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $sermon = $this->findSermon($request, $id);

        if (! $sermon) {
            return response()->json(['message' => 'Sermon not found'], 404);
        }

        return response()->json([
            'id'          => $sermon->id,
            'title'       => $sermon->title,
            'description' => $sermon->description,
            'cover_image' => $sermon->CoverImagePath,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'required|image|mimes:jpg,jpeg,png,webp',
        ]);

        $churchId = $request->user()->church_id;

        $sermon = new Sermon;
        $sermon->church_id = $churchId;
        $sermon->user_id = $request->user()->id;
        $sermon->title = $data['title'];
        $sermon->description = $data['description'] ?? null;
        $sermon->cover_image = $this->uploadFile("{$churchId}/sermons/covers", $request->file('cover_image'));
        $sermon->save();

        $this->doActivityLog(
            $sermon,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_SERMON,
            'Sermon Created!'
        );

        return response()->json(['success' => true, 'id' => $sermon->id], 201);
    }

    public function update(Request $request, $id)
    {
        $sermon = $this->findSermon($request, $id);

        if (! $sermon) {
            return response()->json(['message' => 'Sermon not found'], 404);
        }

        $data = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        $sermon->fill($data);

        if ($request->hasFile('cover_image')) {
            $sermon->cover_image = $this->uploadFile("{$sermon->church_id}/sermons/covers", $request->file('cover_image'));
        }

        $sermon->save();

        $this->doActivityLog(
            $sermon,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_UPDATE_SERMON,
            'Sermon Updated!'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $sermon = $this->findSermon($request, $id);

        if (! $sermon) {
            return response()->json(['message' => 'Sermon not found'], 404);
        }

        SermonLink::where('sermons_id', $id)->delete();
        $sermon->delete();

        $this->doActivityLog(
            $sermon,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_SERMON,
            'Sermon deleted.'
        );

        return response()->json(['success' => true]);
    }

    public function links(Request $request, $id)
    {
        $sermon = $this->findSermon($request, $id);

        if (! $sermon) {
            return response()->json(['message' => 'Sermon not found'], 404);
        }

        $links = SermonLink::where('sermons_id', $id)->orderByDesc('date')->get();

        return response()->json($links->map(fn (SermonLink $l) => [
            'id'         => $l->id,
            'title'      => $l->title,
            'date'       => $l->date,
            'video_link' => $l->video_link,
            'audio_link' => $l->audio_link,
            'pdf_link'   => $l->pdf_link ? $l->PdfUrlPath : null,
        ]));
    }

    public function addLink(Request $request, $id)
    {
        $sermon = $this->findSermon($request, $id);

        if (! $sermon) {
            return response()->json(['message' => 'Sermon not found'], 404);
        }

        $data = $request->validate([
            'title'      => 'nullable|string|max:255',
            'date'       => 'required|date',
            'video_link' => 'nullable|string',
            'audio_link' => 'nullable|string',
            'pdf_link'   => 'nullable|file|mimes:pdf',
        ]);

        $link = new SermonLink;
        $link->church_id = $sermon->church_id;
        $link->user_id = $request->user()->id;
        $link->sermons_id = $sermon->id;
        $link->title = $data['title'] ?? null;
        $link->date = $data['date'];
        $link->video_link = $data['video_link'] ?? null;
        $link->audio_link = $data['audio_link'] ?? null;

        if ($request->hasFile('pdf_link')) {
            $link->pdf_link = $this->uploadFile("{$sermon->church_id}/sermons/documents", $request->file('pdf_link'));
        }

        $link->save();

        $this->doActivityLog(
            $link,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_SERMONLINK,
            'Series Uploaded Successfully'
        );

        return response()->json(['success' => true, 'id' => $link->id], 201);
    }

    public function removeLink(Request $request, $id, $linkId)
    {
        $sermon = $this->findSermon($request, $id);

        if (! $sermon) {
            return response()->json(['message' => 'Sermon not found'], 404);
        }

        $link = SermonLink::where('sermons_id', $id)->find($linkId);

        if (! $link) {
            return response()->json(['message' => 'Link not found'], 404);
        }

        $link->delete();

        $this->doActivityLog(
            $link,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_SERMONLINK,
            'Sermonlink deleted'
        );

        return response()->json(['success' => true]);
    }

    private function findSermon(Request $request, $id): ?Sermon
    {
        return Sermon::where('church_id', $request->user()->church_id)->find($id);
    }
}
