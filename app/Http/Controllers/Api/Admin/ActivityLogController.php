<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

/**
 * Activity log for the Next.js admin console (/console/activity-log).
 * Mirrors app/Http/Controllers/Admin/ActivityLogController — scoped to
 * actions performed by the currently signed-in admin, same as legacy.
 */
class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = ActivityLog::where('causer_id', $request->user()->id)
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'data' => collect($logs->items())->map(fn (ActivityLog $log) => [
                'id'          => $log->id,
                'description' => $log->description,
                'log_name'    => $log->log_name,
                'created_at'  => $log->created_at,
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }
}
