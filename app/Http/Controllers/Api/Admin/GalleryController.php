<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Photos;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Photo galleries + photos CRUD for the Next.js admin console
 * (/console/gallery). Mirrors app/Http/Controllers/Admin/{GalleryController,
 * PhotosController} — photo upload here is a plain multipart file upload
 * rather than the legacy base64-data-URL format, since that was purely a
 * client-side (Vue/canvas cropper) implementation detail, not a stored
 * format requirement.
 */
class GalleryController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Gallery::withCount('photos')->where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $galleries = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($galleries->items())->map(fn (Gallery $g) => [
                'id'          => $g->id,
                'name'        => $g->name,
                'cover_image' => $g->FullPath,
                'photo_count' => $g->photos_count,
            ]),
            'meta' => [
                'current_page' => $galleries->currentPage(),
                'last_page'    => $galleries->lastPage(),
                'total'        => $galleries->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $gallery = $this->findGallery($request, $id);

        if (! $gallery) {
            return response()->json(['message' => 'Gallery not found'], 404);
        }

        return response()->json([
            'id'          => $gallery->id,
            'name'        => $gallery->name,
            'description' => $gallery->description,
            'cover_image' => $gallery->FullPath,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'required|image|mimes:jpg,jpeg,png,webp',
        ]);

        $churchId = $request->user()->church_id;

        $gallery = new Gallery;
        $gallery->church_id = $churchId;
        $gallery->name = $data['name'];
        $gallery->description = $data['description'] ?? null;
        $gallery->path = $this->uploadFile("{$churchId}/gallery/covers", $request->file('cover_image'));
        $gallery->created_by = $request->user()->id;
        $gallery->save();

        $this->doActivityLog(
            $gallery,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_GALLERY_ALBUM,
            'Gallery Album Created Successfully'
        );

        return response()->json(['success' => true, 'id' => $gallery->id], 201);
    }

    public function update(Request $request, $id)
    {
        $gallery = $this->findGallery($request, $id);

        if (! $gallery) {
            return response()->json(['message' => 'Gallery not found'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        $gallery->fill($data);

        if ($request->hasFile('cover_image')) {
            $gallery->path = $this->uploadFile("{$gallery->church_id}/gallery/covers", $request->file('cover_image'));
        }

        $gallery->updated_by = $request->user()->id;
        $gallery->save();

        $this->doActivityLog(
            $gallery,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_GALLERY_ALBUM,
            'Gallery Album Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $gallery = $this->findGallery($request, $id);

        if (! $gallery) {
            return response()->json(['message' => 'Gallery not found'], 404);
        }

        $gallery->delete();

        $this->doActivityLog(
            $gallery,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_GALLERY_ALBUM,
            'Gallery Album Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function photos(Request $request, $id)
    {
        $gallery = $this->findGallery($request, $id);

        if (! $gallery) {
            return response()->json(['message' => 'Gallery not found'], 404);
        }

        $photos = Photos::where('gallery_id', $id)->orderByDesc('created_at')->get();

        return response()->json($photos->map(fn (Photos $p) => ['id' => $p->id, 'path' => $p->FullPath]));
    }

    public function addPhoto(Request $request, $id)
    {
        $gallery = $this->findGallery($request, $id);

        if (! $gallery) {
            return response()->json(['message' => 'Gallery not found'], 404);
        }

        $request->validate(['photo' => 'required|image|mimes:jpg,jpeg,png,webp']);

        $photo = new Photos;
        $photo->church_id = $gallery->church_id;
        $photo->gallery_id = $gallery->id;
        $photo->path = $this->uploadFile("{$gallery->church_id}/gallery/{$gallery->id}/photos", $request->file('photo'));
        $photo->created_by = $request->user()->id;
        $photo->updated_by = $request->user()->id;
        $photo->save();

        $this->doActivityLog(
            $photo,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_PHOTO,
            'Photos Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $photo->id], 201);
    }

    public function removePhoto(Request $request, $id, $photoId)
    {
        $gallery = $this->findGallery($request, $id);

        if (! $gallery) {
            return response()->json(['message' => 'Gallery not found'], 404);
        }

        $photo = Photos::where('gallery_id', $id)->find($photoId);

        if (! $photo) {
            return response()->json(['message' => 'Photo not found'], 404);
        }

        $photo->delete();

        $this->doActivityLog(
            $photo,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_PHOTO,
            'Photo Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    private function findGallery(Request $request, $id): ?Gallery
    {
        return Gallery::where('church_id', $request->user()->church_id)->find($id);
    }
}
