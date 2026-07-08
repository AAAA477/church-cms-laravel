<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageVersion;
use App\Models\User;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * CMS pages CRUD for the Next.js admin console (/console/pages). Mirrors
 * app/Http/Controllers/Admin/PagesController, including version history
 * (auto-saved on every update) and revert. `content` is the rich
 * page-builder JSON blob — this console treats it as an opaque JSON string
 * (a plain textarea), not a WYSIWYG builder; building a full block editor
 * is its own separate project, out of scope here.
 */
class PageController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Page::with('pageCategory')->where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where('page_name', 'like', "%{$search}%");
        }

        $pages = $query->orderBy('menu_order')->paginate(20);

        return response()->json([
            'data' => collect($pages->items())->map(fn (Page $p) => $this->summarize($p)),
            'meta' => [
                'current_page' => $pages->currentPage(),
                'last_page'    => $pages->lastPage(),
                'total'        => $pages->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $page = $this->findPage($request, $id);

        if (! $page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json([
            ...$this->summarize($page),
            'slug'              => $page->slug,
            'menu_text'         => $page->menu_text,
            'menu_order'        => $page->menu_order,
            'meta_title'        => $page->meta_title,
            'meta_description'  => $page->meta_description,
            'meta_keywords'     => $page->meta_keywords,
            'og_image'          => $page->og_image,
            'content'           => $page->content,
            'layout_template'   => $page->layout_template,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'page_name'         => 'required|string|max:255',
            'category_id'       => 'required|integer|exists:page_categories,id',
            'description'       => 'required|string',
            'slug'              => 'nullable|string|max:255',
            'menu_text'         => 'nullable|string|max:80',
            'menu_order'        => 'nullable|integer',
            'meta_title'        => 'nullable|string|max:60',
            'meta_description'  => 'nullable|string|max:160',
            'meta_keywords'     => 'nullable|string|max:255',
            'og_image'          => 'nullable|string',
            'content'           => 'nullable|string',
            'layout_template'   => 'nullable|string|max:20',
            'cover_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        $churchId = $request->user()->church_id;

        $page = new Page;
        $page->church_id = $churchId;
        $page->page_name = $data['page_name'];
        $page->category_id = $data['category_id'];
        $page->description = $data['description'];
        $page->slug = $data['slug'] ?: Str::slug($data['page_name']);
        $page->menu_text = $data['menu_text'] ?? null;
        $page->menu_order = $data['menu_order'] ?? 0;
        $page->meta_title = $data['meta_title'] ?? null;
        $page->meta_description = $data['meta_description'] ?? null;
        $page->meta_keywords = $data['meta_keywords'] ?? null;
        $page->og_image = $data['og_image'] ?? null;
        $page->layout_template = $data['layout_template'] ?? 'left-sidebar';
        if (! empty($data['content'])) {
            $page->content = json_decode($data['content'], true);
        }
        $page->created_by = $request->user()->id;
        $page->status = 1;

        if ($request->hasFile('cover_image')) {
            $page->cover_image = $this->uploadFile("{$churchId}/pages", $request->file('cover_image'));
        }

        $page->save();

        return response()->json(['success' => true, 'id' => $page->id], 201);
    }

    public function update(Request $request, $id)
    {
        $page = $this->findPage($request, $id);

        if (! $page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $data = $request->validate([
            'page_name'         => 'sometimes|required|string|max:255',
            'category_id'       => 'sometimes|required|integer|exists:page_categories,id',
            'description'       => 'sometimes|required|string',
            'slug'              => 'nullable|string|max:255',
            'menu_text'         => 'nullable|string|max:80',
            'menu_order'        => 'nullable|integer',
            'meta_title'        => 'nullable|string|max:60',
            'meta_description'  => 'nullable|string|max:160',
            'meta_keywords'     => 'nullable|string|max:255',
            'og_image'          => 'nullable|string',
            'content'           => 'nullable|string',
            'layout_template'   => 'nullable|string|max:20',
        ]);

        if (isset($data['content'])) {
            $data['content'] = json_decode($data['content'], true);
        }
        if (! empty($data['page_name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['page_name']) . '-' . $page->id;
        }

        $page->fill($data);
        $page->save();

        $nextVersion = (PageVersion::where('page_id', $id)->max('version_number') ?? 0) + 1;
        PageVersion::create([
            'page_id'         => $page->id,
            'version_number'  => $nextVersion,
            'content'         => $page->content ? json_encode($page->content) : null,
            'description'     => $page->description,
            'layout_template' => $page->layout_template,
            'saved_by'        => $request->user()->id,
        ]);

        $this->doActivityLog(
            $page,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_PAGE,
            'Page Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $page = $this->findPage($request, $id);

        if (! $page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $page->delete();

        $this->doActivityLog(
            $page,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_PAGE,
            'Page Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function versions(Request $request, $id)
    {
        $page = $this->findPage($request, $id);

        if (! $page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $versions = PageVersion::where('page_id', $id)
            ->orderByDesc('version_number')
            ->get(['id', 'version_number', 'saved_by', 'created_at']);

        return response()->json($versions->map(fn ($v) => [
            'id'             => $v->id,
            'version_number' => $v->version_number,
            'saved_by'       => optional(User::find($v->saved_by))->name ?? 'Unknown',
            'created_at'     => $v->created_at,
        ]));
    }

    public function revertVersion(Request $request, $id, $versionId)
    {
        $page = $this->findPage($request, $id);

        if (! $page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $version = PageVersion::where('page_id', $id)->find($versionId);

        if (! $version) {
            return response()->json(['message' => 'Version not found'], 404);
        }

        $page->content = $version->content ? json_decode($version->content, true) : null;
        $page->description = $version->description;
        $page->layout_template = $version->layout_template ?? $page->layout_template;
        $page->save();

        $next = (PageVersion::where('page_id', $id)->max('version_number') ?? 0) + 1;
        PageVersion::create([
            'page_id'         => $page->id,
            'version_number'  => $next,
            'content'         => $version->content,
            'description'     => $page->description,
            'layout_template' => $page->layout_template,
            'saved_by'        => $request->user()->id,
        ]);

        return response()->json(['success' => true]);
    }

    private function findPage(Request $request, $id): ?Page
    {
        return Page::with('pageCategory')->where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Page $p): array
    {
        return [
            'id'          => $p->id,
            'page_name'   => $p->page_name,
            'category_id' => $p->category_id,
            'category'    => optional($p->pageCategory)->name,
            'description' => $p->description,
            'cover_image' => $p->CoverImagePath,
            'status'      => (bool) $p->status,
        ];
    }
}
