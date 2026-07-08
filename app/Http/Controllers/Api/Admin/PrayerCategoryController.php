<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrayerCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Prayer categories CRUD for the Next.js admin console
 * (/console/prayer-board/categories). Mirrors
 * app/Http/Controllers/Admin/PrayerCategoryController.
 */
class PrayerCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = PrayerCategory::forChurch($request->user()->church_id)->ordered()->get();

        return response()->json($categories->map(fn (PrayerCategory $c) => $this->summarize($c)));
    }

    public function store(Request $request)
    {
        $churchId = $request->user()->church_id;

        $data = $request->validate([
            'name'           => ['required', 'string', 'max:50', Rule::unique('prayer_categories')->where('church_id', $churchId)],
            'css_class'      => 'required|string|max:50',
            'emoji'          => 'required|string|max:10',
            'display_color'  => 'required|string|size:7',
            'gradient_start' => 'required|string|size:7',
            'gradient_end'   => 'required|string|size:7',
            'sort_order'     => 'required|integer|min:0',
            'is_active'      => 'nullable|boolean',
            'description'    => 'nullable|string|max:500',
        ]);

        $category = PrayerCategory::create([
            ...$data,
            'church_id'  => $churchId,
            'is_active'  => $request->boolean('is_active', true),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['success' => true, 'id' => $category->id], 201);
    }

    public function update(Request $request, $id)
    {
        $churchId = $request->user()->church_id;
        $category = PrayerCategory::forChurch($churchId)->find($id);

        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $data = $request->validate([
            'name'           => ['sometimes', 'required', 'string', 'max:50', Rule::unique('prayer_categories')->where('church_id', $churchId)->ignore($id)],
            'css_class'      => 'sometimes|required|string|max:50',
            'emoji'          => 'sometimes|required|string|max:10',
            'display_color'  => 'sometimes|required|string|size:7',
            'gradient_start' => 'sometimes|required|string|size:7',
            'gradient_end'   => 'sometimes|required|string|size:7',
            'sort_order'     => 'sometimes|required|integer|min:0',
            'is_active'      => 'nullable|boolean',
            'description'    => 'nullable|string|max:500',
        ]);

        $category->update([...$data, 'updated_by' => $request->user()->id]);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $category = PrayerCategory::forChurch($request->user()->church_id)->find($id);

        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        if (! $category->canBeDeleted()) {
            return response()->json(['message' => 'Cannot delete a category that has active or pending prayers.'], 422);
        }

        $category->delete();

        return response()->json(['success' => true]);
    }

    private function summarize(PrayerCategory $c): array
    {
        return [
            'id'             => $c->id,
            'name'           => $c->name,
            'css_class'      => $c->css_class,
            'emoji'          => $c->emoji,
            'display_color'  => $c->display_color,
            'gradient_start' => $c->gradient_start,
            'gradient_end'   => $c->gradient_end,
            'sort_order'     => $c->sort_order,
            'is_active'      => (bool) $c->is_active,
            'description'    => $c->description,
        ];
    }
}
