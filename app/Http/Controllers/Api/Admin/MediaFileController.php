<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Traits\Common;
use Illuminate\Http\Request;

/**
 * Media library (audio / video / image) for the Next.js admin console
 * (/console/mediafiles). Mirrors app/Http/Controllers/Admin/
 * MediaFilesController + Video/Audio/ImageController: files are stored via
 * the shared uploadFile helper, videos/audio may alternatively reference an
 * external URL (type = 'url').
 */
class MediaFileController extends Controller
{
    use Common;

    public function index(Request $request)
    {
        $type = in_array($request->query('type'), ['audio', 'video', 'image'])
            ? $request->query('type') : 'image';

        $query = MediaFile::where('church_id', $request->user()->church_id)
            ->where('media_type', $type);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $files = $query->orderByDesc('created_at')->paginate(24)->withQueryString();

        return response()->json([
            'data' => collect($files->items())->map(fn (MediaFile $f) => [
                'id'          => $f->id,
                'name'        => $f->name,
                'description' => $f->description,
                'media_type'  => $f->media_type,
                'type'        => $f->type,
                'url'         => $f->type === 'url' ? $f->url : $f->UrlPath,
                'created_at'  => optional($f->created_at)->toDateTimeString(),
            ]),
            'meta' => [
                'current_page' => $files->currentPage(),
                'last_page'    => $files->lastPage(),
                'total'        => $files->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'media_type'  => 'required|in:audio,video,image',
            'type'        => 'required|in:file,url',
            'url'         => 'required_if:type,url|nullable|url|max:2048',
            'file'        => 'required_if:type,file|nullable|file|max:51200',
        ]);

        $church_id = $request->user()->church_id;

        $file = new MediaFile;
        $file->church_id   = $church_id;
        $file->media_type  = $data['media_type'];
        $file->name        = $data['name'];
        $file->description = $data['description'] ?? null;
        $file->type        = $data['type'];

        if ($data['type'] === 'url') {
            $file->url = $data['url'];
        } else {
            // Same folder convention as the legacy Video/Audio/ImageController.
            $folder = $church_id . '/uploads/files/' . $data['media_type'];
            $file->url = $this->uploadFile($folder, $request->file('file'));
        }

        $file->save();

        return response()->json(['success' => true, 'id' => $file->id], 201);
    }

    public function destroy(Request $request, $id)
    {
        $file = MediaFile::where('church_id', $request->user()->church_id)->find($id);

        if (! $file) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $file->delete();

        return response()->json(['success' => true]);
    }
}
