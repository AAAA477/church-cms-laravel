<?php

namespace App\Http\Resources\API\Guest;

use Illuminate\Http\Resources\Json\JsonResource;

class Post extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'category'    => $this->category ? [
                'id'   => $this->category->id,
                'name' => $this->category->name,
            ] : null,
            'tags'        => $this->tags->pluck('tag_name'),
            'cover'       => !empty($this->attachment_file) ? $this->cover_path : null,
            'attachments' => $this->attachment_path,
            'like_count'  => $this->public_like_count ?? 0,
            'date'        => optional($this->post_created_at)->format('d M Y'),
        ];
    }
}
