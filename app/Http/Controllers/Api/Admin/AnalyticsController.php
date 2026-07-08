<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Google Analytics datasets for the Next.js admin console
 * (/console/google-analytics). Mirrors app/Http/Controllers/Admin/
 * GoogleAnalyticsController: returns the five 7-day report sets, or empty
 * arrays with configured=false when the spatie/laravel-analytics package
 * isn't bound or credentials are missing.
 */
class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $empty = [
            'configured'      => false,
            'mostVisitedPages' => [],
            'pageViews'       => [],
            'referrers'       => [],
            'userTypes'       => [],
            'browsers'        => [],
        ];

        $periodClass = 'Spatie\\Analytics\\Period';

        if (! app()->bound('analytics') || ! class_exists($periodClass)) {
            return response()->json($empty);
        }

        try {
            $analytics = app('analytics');
            $period = $periodClass::days(7);

            return response()->json([
                'configured'       => true,
                'mostVisitedPages' => $analytics->fetchMostVisitedPages($period),
                'pageViews'        => $analytics->fetchVisitorsAndPageViews($period),
                'referrers'        => $analytics->fetchTopReferrers($period),
                'userTypes'        => $analytics->fetchUserTypes($period),
                'browsers'         => $analytics->fetchTopBrowsers($period),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch Google Analytics data: ' . $e->getMessage());

            return response()->json($empty);
        }
    }
}
