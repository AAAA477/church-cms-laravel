<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Quotes/devotionals CRUD for the Next.js admin console (/console/quotes).
 *
 * Mirrors app/Http/Controllers/Admin/QuotesController's core authoring flow
 * (image quote or plain text quote, scheduled via `publish_on`) but drops
 * the Tamil/English Bible-book-and-chapter browsing tab — that's a large,
 * separate content-picker feature (requires the BibleBook/BibleVerse
 * browsing UI) better suited to its own follow-up than bundled here.
 * `tamil_quotes`/`english_quotes` remain plain optional textareas so
 * existing scripture-quote content isn't blocked, just not guided by a
 * picker.
 */
class QuoteController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = Quote::where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('text', 'like', "%{$search}%")
                    ->orWhere('english_quotes', 'like', "%{$search}%");
            });
        }

        $quotes = $query->orderByDesc('publish_on')->paginate(20);

        return response()->json([
            'data' => collect($quotes->items())->map(fn (Quote $q) => $this->summarize($q)),
            'meta' => [
                'current_page' => $quotes->currentPage(),
                'last_page'    => $quotes->lastPage(),
                'total'        => $quotes->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $quote = $this->findQuote($request, $id);

        if (! $quote) {
            return response()->json(['message' => 'Quote not found'], 404);
        }

        return response()->json($this->summarize($quote));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'text'           => 'nullable|string',
            'tamil_quotes'   => 'nullable|string',
            'english_quotes' => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpg,jpeg,png,webp',
            'publish_on'     => 'required|date',
        ]);

        $churchId = $request->user()->church_id;

        $quote = new Quote;
        $quote->church_id = $churchId;
        $quote->user_id = $request->user()->id;
        $quote->text = $data['text'] ?? null;
        $quote->tamil_quotes = $data['tamil_quotes'] ?? null;
        $quote->english_quotes = $data['english_quotes'] ?? null;
        $quote->publish_on = $data['publish_on'];

        if ($request->hasFile('image')) {
            $quote->image = $this->uploadFile("{$churchId}/quotes", $request->file('image'));
        }

        $quote->save();

        $this->doActivityLog(
            $quote,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_QUOTE,
            'Quotes Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $quote->id], 201);
    }

    public function update(Request $request, $id)
    {
        $quote = $this->findQuote($request, $id);

        if (! $quote) {
            return response()->json(['message' => 'Quote not found'], 404);
        }

        $data = $request->validate([
            'text'           => 'nullable|string',
            'tamil_quotes'   => 'nullable|string',
            'english_quotes' => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpg,jpeg,png,webp',
            'publish_on'     => 'sometimes|required|date',
        ]);

        $quote->fill($data);

        if ($request->hasFile('image')) {
            $quote->image = $this->uploadFile("{$quote->church_id}/quotes", $request->file('image'));
        }

        $quote->save();

        $this->doActivityLog(
            $quote,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_QUOTE,
            'Quotes Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function reschedule(Request $request, $id)
    {
        $quote = $this->findQuote($request, $id);

        if (! $quote) {
            return response()->json(['message' => 'Quote not found'], 404);
        }

        $data = $request->validate(['publish_on' => 'required|date']);

        $new = new Quote;
        $new->church_id = $quote->church_id;
        $new->user_id = $request->user()->id;
        $new->image = $quote->image;
        $new->text = $quote->text;
        $new->tamil_quotes = $quote->tamil_quotes;
        $new->english_quotes = $quote->english_quotes;
        $new->publish_on = $data['publish_on'];
        $new->save();

        $this->doActivityLog(
            $new,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_RESCHEDULE_QUOTE,
            'Quotes Rescheduled Successfully'
        );

        return response()->json(['success' => true, 'id' => $new->id], 201);
    }

    public function destroy(Request $request, $id)
    {
        $quote = $this->findQuote($request, $id);

        if (! $quote) {
            return response()->json(['message' => 'Quote not found'], 404);
        }

        $quote->delete();

        $this->doActivityLog(
            $quote,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_QUOTE,
            'Quote Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    private function findQuote(Request $request, $id): ?Quote
    {
        return Quote::where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Quote $q): array
    {
        return [
            'id'             => $q->id,
            'text'           => $q->text,
            'tamil_quotes'   => $q->tamil_quotes,
            'english_quotes' => $q->english_quotes,
            'image'          => $q->image ? $q->ImagePath : null,
            'publish_on'     => $q->publish_on,
        ];
    }
}
