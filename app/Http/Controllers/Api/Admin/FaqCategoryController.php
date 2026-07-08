<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FaqCategory;
use Illuminate\Http\Request;

/**
 * FAQ categories CRUD for the Next.js admin console (/console/faq).
 * Mirrors app/Http/Controllers/Admin/FaqCategoryController.
 */
class FaqCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = FaqCategory::where('church_id', $request->user()->church_id)->orderBy('name')->get();

        return response()->json($categories->map(fn (FaqCategory $c) => [
            'id'     => $c->id,
            'name'   => $c->name,
            'status' => (bool) $c->status,
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);

        $category = FaqCategory::create([...$data, 'church_id' => $request->user()->church_id, 'status' => 1]);

        return response()->json(['success' => true, 'id' => $category->id], 201);
    }

    public function update(Request $request, $id)
    {
        $category = FaqCategory::where('church_id', $request->user()->church_id)->find($id);

        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $data = $request->validate(['name' => 'sometimes|required|string|max:255']);
        $category->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $category = FaqCategory::where('church_id', $request->user()->church_id)->find($id);

        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json(['success' => true]);
    }
}
