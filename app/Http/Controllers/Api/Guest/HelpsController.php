<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Resources\API\Guest\Help as HelpResource;
use App\Http\Controllers\Controller;
use App\Models\Help;
use Illuminate\Http\Request;

class HelpsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($church_id)
    {
        //
        $help = Help::where([['church_id',$church_id],['status','approve']])->latest()->get();

        $help = HelpResource::collection($help);

        return $help;
    }

    /**
     * Submit a new help request. Requires a signed-in member, mirroring
     * WebBuilder\HelpRequestController@store's webguest middleware.
     */
    public function store(Request $request, $church_id)
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'required|string|max:3000',
            'contact_details' => 'required|string|max:500',
        ]);

        $help = Help::create([
            'church_id'       => $church_id,
            'user_id'         => $request->user()->id,
            'title'           => $validated['title'],
            'description'     => $validated['description'],
            'contact_details' => $validated['contact_details'],
            'status'          => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your help request has been submitted and is awaiting review.',
            'id'      => $help->id,
        ], 201);
    }
}