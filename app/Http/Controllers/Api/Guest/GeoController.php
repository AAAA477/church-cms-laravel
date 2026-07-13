<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

/**
 * Public country/state/city lookups for the self-registration form's
 * cascading address selects. Read-only id+name pairs from the master
 * data tables (same data the admin console uses).
 */
class GeoController extends Controller
{
    public function countries()
    {
        return response()->json(
            DB::table('countries')->orderBy('name')->get(['id', 'name'])
        );
    }

    public function states($country_id)
    {
        return response()->json(
            DB::table('states')
                ->where('country_id', (int) $country_id)
                ->orderBy('name')
                ->get(['id', 'name'])
        );
    }

    public function cities($state_id)
    {
        return response()->json(
            DB::table('cities')
                ->where('state_id', (int) $state_id)
                ->orderBy('name')
                ->get(['id', 'name'])
        );
    }
}
