<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Page categories CRUD for the Next.js admin console (/console/pages).
 * Mirrors app/Http/Controllers/Admin/PageCategoryController.
 */
class PageCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = PageCategory::where('church_id', $request->user()->church_id)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($categories->map(fn (PageCategory $c) => $this->summarize($c)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:page_categories,slug',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer',
        ]);

        $category = PageCategory::create([
            ...$data,
            'church_id'  => $request->user()->church_id,
            'slug'       => $data['slug'] ?: Str::slug($data['name']),
            'sort_order' => $data['sort_order'] ?? 0,
            'status'     => 1,
        ]);

        return response()->json(['success' => true, 'id' => $category->id], 201);
    }

    public function update(Request $request, $id)
    {
        $category = $this->findCategory($request, $id);

        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('page_categories', 'slug')->ignore($id)],
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer',
        ]);

        $category->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $category = $this->findCategory($request, $id);

        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json(['success' => true]);
    }

    private function findCategory(Request $request, $id): ?PageCategory
    {
        return PageCategory::where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(PageCategory $c): array
    {
        return [
            'id'          => $c->id,
            'name'        => $c->name,
            'slug'        => $c->slug,
            'description' => $c->description,
            'sort_order'  => $c->sort_order,
        ];
    }
}
