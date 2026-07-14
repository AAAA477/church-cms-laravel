<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Resources\API\Guest\Sermon as SermonResource;
use App\Http\Controllers\Controller;
use App\Models\SermonLink;
use App\Models\Sermon;
use App\Traits\Common;

class SermonsController extends Controller
{
    use Common;

    public function index($church_id)
    {
        $sermon = Sermon::where('church_id',$church_id)->latest()->paginate(10);

        $sermon = SermonResource::collection($sermon);

        return $sermon;
    }

	/**
	 * Each sermons_links row can carry a video, audio, and/or PDF link
	 * together — the guest-facing list needs one entry per populated URL,
	 * not one per row (there is no type/url column on this table).
	 */
	public function show($church_id,$sermons_id)
    {
        $links = SermonLink::with('sermons')
            ->where([['sermons_id', $sermons_id], ['church_id', $church_id]])
            ->orderByDesc('date')
            ->get();

        $items = collect();

        foreach ($links as $link) {
            $title = $link->title ?: optional($link->sermons)->title;

            if ($link->video_link) {
                $items->push(['title' => $title, 'type' => 'video', 'url' => $link->video_link, 'date' => $link->date]);
            }
            if ($link->audio_link) {
                $items->push(['title' => $title, 'type' => 'audio', 'url' => $link->audio_link, 'date' => $link->date]);
            }
            if ($link->pdf_link) {
                $items->push(['title' => $title, 'type' => 'document', 'url' => $this->getFilePath($link->pdf_link), 'date' => $link->date]);
            }
        }

        return response()->json(['data' => $items->values()]);
    }
}