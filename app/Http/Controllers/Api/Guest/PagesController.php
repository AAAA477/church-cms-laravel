<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\Page;

class PagesController extends Controller
{
    /**
     * Active pages joined with their category, in menu order.
     */
    private function activePages($church_id)
    {
        return Page::with('pageCategory')
            ->where('pages.status', 1)
            ->where('pages.church_id', $church_id)
            ->join('page_categories', 'pages.category_id', '=', 'page_categories.id')
            ->orderBy('page_categories.sort_order')
            ->orderBy('pages.menu_order')
            ->orderBy('pages.page_name')
            ->select('pages.*')
            ->get();
    }

    /**
     * Display the page navigation tree grouped by category.
     *
     * @param  int  $church_id
     * @return \Illuminate\Http\Response
     */
    public function index($church_id)
    {
        $grouped = $this->activePages($church_id)
            ->groupBy(fn ($p) => optional($p->pageCategory)->name ?? 'General');

        return response()->json([
            'data' => $grouped->map(fn ($pages, $categoryName) => [
                'category'      => $categoryName,
                'category_slug' => optional($pages->first()->pageCategory)->slug,
                'pages'         => $pages->map(fn ($p) => [
                    'id'    => $p->id,
                    'name'  => $p->page_name,
                    'slug'  => $p->slug,
                ])->values(),
            ])->values(),
        ]);
    }

    /**
     * Display a single page by category slug and page slug.
     *
     * @param  int     $church_id
     * @param  string  $categorySlug
     * @param  string  $pageSlug
     * @return \Illuminate\Http\Response
     */
    public function show($church_id, $categorySlug, $pageSlug)
    {
        $page = $this->activePages($church_id)->first(function ($p) use ($categorySlug, $pageSlug) {
            return $p->slug === $pageSlug
                && optional($p->pageCategory)->slug === $categorySlug;
        });

        if (! $page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json([
            'data' => [
                'id'            => $page->id,
                'name'          => $page->page_name,
                'slug'          => $page->slug,
                'category'      => optional($page->pageCategory)->name,
                'category_slug' => optional($page->pageCategory)->slug,
                'description'   => $page->description,
                'cover_image'   => $page->cover_image ? $page->getFilePath($page->cover_image) : null,
            ],
        ]);
    }
}
