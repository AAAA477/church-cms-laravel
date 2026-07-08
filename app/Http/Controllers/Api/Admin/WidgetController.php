<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * CMS widgets CRUD for the Next.js admin console (/console/widgets).
 * Mirrors app/Http/Controllers/Admin/WidgetController.
 */
class WidgetController extends Controller
{
    public function index(Request $request)
    {
        $widgets = Widget::where('church_id', $request->user()->church_id)->orderByDesc('id')->paginate(20);

        return response()->json([
            'data' => collect($widgets->items())->map(fn (Widget $w) => $this->summarize($w)),
            'meta' => [
                'current_page' => $widgets->currentPage(),
                'last_page'    => $widgets->lastPage(),
                'total'        => $widgets->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $widget = $this->findWidget($request, $id);

        if (! $widget) {
            return response()->json(['message' => 'Widget not found'], 404);
        }

        return response()->json($this->summarize($widget));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'page'          => 'nullable|string|max:255',
            'position'      => 'nullable|in:top,bottom',
            'display_order' => 'nullable|integer',
            'content'       => 'required|string',
        ]);

        $widget = new Widget;
        $widget->slug = (string) Str::uuid();
        $widget->church_id = $request->user()->church_id;
        $widget->page = $data['page'] ?? 'home';
        if ($widget->page !== 'home') {
            $widget->position = $data['position'] ?? null;
        }
        $widget->display_order = $data['display_order'] ?? 0;
        $widget->content = $data['content'];
        $widget->created_by = $request->user()->id;
        $widget->save();

        return response()->json(['success' => true, 'id' => $widget->id], 201);
    }

    public function update(Request $request, $id)
    {
        $widget = $this->findWidget($request, $id);

        if (! $widget) {
            return response()->json(['message' => 'Widget not found'], 404);
        }

        $data = $request->validate([
            'page'          => 'nullable|string|max:255',
            'position'      => 'nullable|in:top,bottom',
            'display_order' => 'nullable|integer',
            'content'       => 'sometimes|required|string',
        ]);

        $widget->fill($data);
        if (isset($data['page']) && $data['page'] !== 'home') {
            $widget->position = $data['position'] ?? $widget->position;
        }
        $widget->updated_by = $request->user()->id;
        $widget->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $widget = $this->findWidget($request, $id);

        if (! $widget) {
            return response()->json(['message' => 'Widget not found'], 404);
        }

        $widget->delete();

        return response()->json(['success' => true]);
    }

    private function findWidget(Request $request, $id): ?Widget
    {
        return Widget::where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Widget $w): array
    {
        return [
            'id'            => $w->id,
            'page'          => $w->page,
            'position'      => $w->position,
            'display_order' => $w->display_order,
            'content'       => $w->content,
        ];
    }
}
