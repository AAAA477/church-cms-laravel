<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventGallery;
use App\Models\Events;
use App\Traits\Common;
use App\Traits\LogActivity;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Events CRUD for the Next.js admin console (/console/events).
 *
 * Mirrors app/Http/Controllers/Admin/EventsController's simple create/update
 * path (the `store`/`update` methods), not the recurring-series-expansion
 * generator (`storeNew`/`saveRecurringEvent`) — that algorithm materializes
 * one DB row per occurrence and is a large standalone feature better handled
 * as its own follow-up if the user wants recurring-series authoring in the
 * new console. Here `repeats`/`freq`/`freq_term` are stored as flat fields
 * on a single event row, matching the schema directly.
 */
class EventController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;
        $now = now();

        $query = Events::where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $filter = $request->query('filter', 'all');
        if ($filter === 'upcoming') {
            $query->where('start_date', '>=', $now);
        } elseif ($filter === 'completed') {
            $query->where('end_date', '<', $now);
        }

        $events = $query->orderByDesc('start_date')->paginate(20);

        return response()->json([
            'data' => collect($events->items())->map(fn (Events $e) => $this->summarize($e)),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page'    => $events->lastPage(),
                'total'        => $events->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $event = $this->findEvent($request, $id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        return response()->json($this->detail($event));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $event = new Events;
        $event->church_id = $request->user()->church_id;
        $event->fill($data);

        if ($request->hasFile('image')) {
            $event->image = $this->uploadFile("{$event->church_id}/events", $request->file('image'));
        }

        $event->created_by = $request->user()->id;
        $event->save();

        $this->doActivityLog(
            $event,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_EVENT,
            'Event Added: ' . $event->title
        );

        return response()->json(['success' => true, 'id' => $event->id], 201);
    }

    public function update(Request $request, $id)
    {
        $event = $this->findEvent($request, $id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $data = $this->validated($request, true);
        $event->fill($data);

        if ($request->hasFile('image')) {
            $event->image = $this->uploadFile("{$event->church_id}/events", $request->file('image'));
        }

        $event->updated_by = $request->user()->id;
        $event->save();

        $this->doActivityLog(
            $event,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_EVENT,
            'Event Updated: ' . $event->title
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $event = $this->findEvent($request, $id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $event->delete();

        $this->doActivityLog(
            $event,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_EVENT,
            'Event Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function photos(Request $request, $id)
    {
        $event = $this->findEvent($request, $id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $photos = EventGallery::where('event_id', $id)->orderByDesc('created_at')->get();

        return response()->json($photos->map(fn (EventGallery $p) => [
            'id'   => $p->id,
            'path' => $this->getFilePath($p->path),
        ]));
    }

    public function addPhoto(Request $request, $id)
    {
        $event = $this->findEvent($request, $id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $request->validate(['photo' => 'required|image|mimes:jpg,jpeg,png,webp']);

        $photo = new EventGallery;
        $photo->church_id = $event->church_id;
        $photo->event_id = $event->id;
        $photo->path = $this->uploadFile("{$event->church_id}/events/{$event->id}/gallery", $request->file('photo'));
        $photo->created_by = $request->user()->id;
        $photo->updated_by = $request->user()->id;
        $photo->save();

        $this->doActivityLog(
            $photo,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EVENT_PHOTO,
            'Event photo added'
        );

        return response()->json(['success' => true, 'id' => $photo->id], 201);
    }

    public function removePhoto(Request $request, $id, $photoId)
    {
        $event = $this->findEvent($request, $id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $photo = EventGallery::where('event_id', $id)->find($photoId);

        if (! $photo) {
            return response()->json(['message' => 'Photo not found'], 404);
        }

        $photo->delete();

        return response()->json(['success' => true]);
    }

    /**
     * @return array
     */
    private function validated(Request $request, bool $isUpdate = false): array
    {
        $prefix = $isUpdate ? 'sometimes|required' : 'required';

        $data = $request->validate([
            'title'          => "{$prefix}|string|max:100",
            'description'    => 'nullable|string',
            'select_type'    => 'nullable|in:public,private,online',
            'category'       => 'nullable|in:prayer,education,meeting,culturals,sermon',
            'location'       => 'nullable|string',
            'organised_by'   => 'nullable|string',
            'start_date'     => "{$prefix}|date",
            'end_date'       => "{$prefix}|date|after_or_equal:start_date",
            'repeats'        => 'nullable|boolean',
            'freq'           => 'nullable|integer|min:1',
            'freq_term'      => 'nullable|in:day,week,month,year',
            'publish_to_web' => 'nullable|boolean',
            'enable_gallery' => 'nullable|boolean',
        ]);

        // start_date/end_date aren't cast on the model, so a browser's ISO
        // "T"-separated datetime-local value would hit MySQL's DATETIME
        // columns raw and fail — normalize to MySQL's expected format here.
        foreach (['start_date', 'end_date'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = Carbon::parse($data[$field])->format('Y-m-d H:i:s');
            }
        }

        return $data;
    }

    private function findEvent(Request $request, $id): ?Events
    {
        return Events::where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Events $event): array
    {
        return [
            'id'          => $event->id,
            'title'       => $event->title,
            'category'    => $event->category,
            'location'    => $event->location,
            'start_date'  => $event->start_date,
            'end_date'    => $event->end_date,
            'image'       => $event->ImagePath,
        ];
    }

    private function detail(Events $event): array
    {
        return [
            'id'              => $event->id,
            'title'           => $event->title,
            'description'     => $event->description,
            'select_type'     => $event->select_type,
            'category'        => $event->category,
            'location'        => $event->location,
            'organised_by'    => $event->organised_by,
            'start_date'      => $event->start_date,
            'end_date'        => $event->end_date,
            'repeats'         => (bool) $event->repeats,
            'freq'            => $event->freq,
            'freq_term'       => $event->freq_term,
            'publish_to_web'  => (bool) $event->publish_to_web,
            'enable_gallery'  => (bool) $event->enable_gallery,
            'image'           => $event->ImagePath,
        ];
    }
}
