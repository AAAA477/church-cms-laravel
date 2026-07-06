<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\Guest\Post as PostResource;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\PostComment;
use Illuminate\Http\Request;

class PostsController extends Controller
{
    /**
     * Display a paginated listing of published posts.
     *
     * @param  int  $church_id
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $church_id)
    {
        $categories = PostCategory::withCount(['posts' => function ($q) use ($church_id) {
                $q->where('is_posted', 1)->where('status', 'posted')->where('church_id', $church_id);
            }])
            ->where('status', 1)
            ->where('church_id', $church_id)
            ->having('posts_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name']);

        $posts = Post::with(['category', 'tags'])
            ->where('is_posted', 1)
            ->where('status', 'posted')
            ->where('church_id', $church_id)
            ->when($request->query('category'), fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->query('tag'), fn ($q, $t) => $q->whereHas('tags', fn ($tq) => $tq->where('tag_name', $t)))
            ->orderBy('post_created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return PostResource::collection($posts)->additional([
            'categories' => $categories->map(fn ($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'posts_count' => $c->posts_count,
            ]),
        ]);
    }

    /**
     * Display a single published post with its approved comments.
     *
     * @param  int  $church_id
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($church_id, $id)
    {
        $post = Post::with(['category', 'tags'])
            ->where('id', $id)
            ->where('church_id', $church_id)
            ->where('is_posted', 1)
            ->where('status', 'posted')
            ->firstOrFail();

        $comments = PostComment::with('user')
            ->where('entity_id', $post->id)
            ->where('entity_name', 'App\\Models\\Post')
            ->where('status', 1)
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'comments_page');

        return (new PostResource($post))->additional([
            'comments' => [
                'data' => $comments->map(fn ($c) => [
                    'id'         => $c->id,
                    'name'       => $c->guest_name ?: optional($c->user)->name,
                    'comment'    => $c->comments,
                    'like_count' => $c->public_like_count ?? 0,
                    'date'       => $c->created_at->format('d M Y h:i A'),
                ]),
                'total'        => $comments->total(),
                'current_page' => $comments->currentPage(),
                'last_page'    => $comments->lastPage(),
            ],
        ]);
    }
}
