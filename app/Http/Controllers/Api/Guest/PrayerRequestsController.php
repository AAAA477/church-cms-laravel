<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Resources\API\Guest\PrayerRequest as PrayerRequestResource;
use App\Http\Controllers\Controller;
use App\Models\Prayer;
use App\Models\PrayerParticipant;
use Illuminate\Http\Request;

class PrayerRequestsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($church_id)
    {
        $prayer = Prayer::where('church_id', $church_id)
                        ->where('status', Prayer::STATUS_ACTIVE)
                        ->get();
        $prayer = PrayerRequestResource::collection($prayer);

        return $prayer;
    }

    /**
     * Record a prayer participation ("lift") for a member or guest.
     *
     * Members are identified via sanctum token; guests are deduplicated by
     * a hash of ip|user-agent|prayer id. Mirrors WebBuilder\PrayerRequestController@lift.
     *
     * @param  int  $church_id
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function lift(Request $request, $church_id, $id)
    {
        $prayer = Prayer::where('id', $id)
            ->where('church_id', $church_id)
            ->where('status', Prayer::STATUS_ACTIVE)
            ->first();

        if (!$prayer) {
            return response()->json([
                'success' => false,
                'error'   => 'This prayer is no longer active',
                'code'    => 'PRAYER_INACTIVE',
            ], 422);
        }

        $user = auth('sanctum')->user();

        if ($user) {
            $type = PrayerParticipant::TYPE_MEMBER;
            $hash = null;
        } else {
            $type = PrayerParticipant::TYPE_GUEST;
            $hash = hash('sha256', $request->ip() . '|' . $request->userAgent() . '|' . $id);
        }

        $lifted = PrayerParticipant::lift($prayer, $user, $type, $hash);

        if (!$lifted) {
            return response()->json([
                'success' => false,
                'error'   => 'You have already prayed for this',
                'code'    => 'DUPLICATE_PARTICIPATION',
            ], 403);
        }

        $prayer->refresh();

        return response()->json([
            'success'               => true,
            'message'               => 'Prayer recorded',
            'participant_count'     => $prayer->total_participant_count,
            'participant_breakdown' => [
                'total'     => $prayer->total_participant_count,
                'members'   => $prayer->member_count,
                'guests'    => $prayer->guest_count,
                'anonymous' => $prayer->anonymous_count,
            ],
        ]);
    }
}
