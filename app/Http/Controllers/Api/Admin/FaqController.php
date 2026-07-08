<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * FAQ CRUD for the Next.js admin console (/console/faq). Mirrors
 * app/Http/Controllers/Admin/FaqController.
 */
class FaqController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Faq::with('faqCategory')->where('church_id', $churchId);

        if ($categoryId = $request->query('category_id')) {
            $query->where('faq_category_id', $categoryId);
        }

        $faqs = $query->orderBy('order')->paginate(20);

        return response()->json([
            'data' => collect($faqs->items())->map(fn (Faq $f) => $this->summarize($f)),
            'meta' => [
                'current_page' => $faqs->currentPage(),
                'last_page'    => $faqs->lastPage(),
                'total'        => $faqs->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $faq = $this->findFaq($request, $id);

        if (! $faq) {
            return response()->json(['message' => 'FAQ not found'], 404);
        }

        return response()->json($this->summarize($faq));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'faq_category_id' => 'required|integer|exists:faq_categories,id',
            'question'        => 'required|string|max:255',
            'answer'          => 'required|string',
            'order'           => 'nullable|string',
        ]);

        $faq = Faq::create([...$data, 'church_id' => $request->user()->church_id, 'status' => 1]);

        $this->doActivityLog(
            $faq,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_FAQ,
            'FAQ Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $faq->id], 201);
    }

    public function update(Request $request, $id)
    {
        $faq = $this->findFaq($request, $id);

        if (! $faq) {
            return response()->json(['message' => 'FAQ not found'], 404);
        }

        $data = $request->validate([
            'faq_category_id' => 'sometimes|required|integer|exists:faq_categories,id',
            'question'        => 'sometimes|required|string|max:255',
            'answer'          => 'sometimes|required|string',
            'order'           => 'nullable|string',
        ]);

        $faq->update($data);

        $this->doActivityLog(
            $faq,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_FAQ,
            'FAQ Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $faq = $this->findFaq($request, $id);

        if (! $faq) {
            return response()->json(['message' => 'FAQ not found'], 404);
        }

        $faq->delete();

        $this->doActivityLog(
            $faq,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_FAQ,
            'FAQ Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    private function findFaq(Request $request, $id): ?Faq
    {
        return Faq::with('faqCategory')->where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Faq $f): array
    {
        return [
            'id'              => $f->id,
            'faq_category_id' => $f->faq_category_id,
            'category'        => optional($f->faqCategory)->name,
            'question'        => $f->question,
            'answer'          => $f->answer,
            'order'           => $f->order,
        ];
    }
}
