<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\FaqCategory;

class FaqController extends Controller
{
    /**
     * Display FAQ categories with their active questions.
     *
     * @param  int  $church_id
     * @return \Illuminate\Http\Response
     */
    public function index($church_id)
    {
        $categories = FaqCategory::with(['faq' => function ($q) {
                $q->where('status', 1)->orderBy('order');
            }])
            ->where('status', 1)
            ->where('church_id', $church_id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories->map(fn ($category) => [
                'id'   => $category->id,
                'name' => $category->name,
                'faqs' => $category->faq->map(fn ($faq) => [
                    'id'       => $faq->id,
                    'question' => $faq->question,
                    'answer'   => $faq->answer,
                ]),
            ]),
        ]);
    }
}
