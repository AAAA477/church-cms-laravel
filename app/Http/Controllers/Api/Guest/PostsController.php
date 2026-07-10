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
        // Filter on posts_count in PHP: MySQL lets HAVING reference the
        // withCount alias, Postgres does not (SQLSTATE 42703).
        $categories = PostCategory::withCount(['posts' => function ($q) use ($church_id) {
                $q->where('is_posted', 1)->where('status', 'posted')->where('church_id', $church_id);
            }])
            ->where('status', 1)
            ->where('church_id', $church_id)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->filter(fn ($c) => $c->posts_count > 0)
            ->values();

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

    /**
     * Submit a comment on a post. Requires a signed-in member, mirroring
     * WebBuilder\PostController@storeComment's webguest middleware. Comments
     * are held for moderation (status 0) like the legacy site.
     */
    public function storeComment(Request $request, $church_id, $id)
    {
        $post = Post::where('id', $id)
            ->where('church_id', $church_id)
            ->where('is_posted', 1)
            ->where('status', 'posted')
            ->firstOrFail();

        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $user    = $request->user();
        $profile = optional($user->userprofile);

        PostComment::create([
            'user_id'     => $user->id,
            'guest_name'  => trim(($profile->firstname ?? '') . ' ' . ($profile->lastname ?? '')) ?: $user->name,
            'guest_email' => $user->email,
            'entity_id'   => $post->id,
            'entity_name' => 'App\\Models\\Post',
            'comments'    => $request->input('comment'),
            'status'      => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your comment has been submitted and is awaiting moderation. Thank you!',
        ], 201);
    }

    /**
     * Toggle the caller's like on a post. Anonymous (no auth required),
     * mirroring WebBuilder\PostController@toggleLike which only ever used
     * a session flag, never a real identity — the client tells us the
     * desired next state and we trust it, same trust boundary as before.
     */
    public function toggleLike(Request $request, $church_id, $id)
    {
        $request->validate(['liked' => 'required|boolean']);

        $post = Post::where('id', $id)
            ->where('church_id', $church_id)
            ->where('is_posted', 1)
            ->where('status', 'posted')
            ->firstOrFail();

        if ($request->boolean('liked')) {
            $post->increment('public_like_count');
        } else {
            $post->decrement('public_like_count');
        }

        return response()->json([
            'liked' => $request->boolean('liked'),
            'count' => $post->fresh()->public_like_count,
        ]);
    }

    /**
     * Toggle the caller's like on a comment. Anonymous, same trust model
     * as toggleLike above (mirrors WebBuilder\PostController@toggleCommentLike).
     */
    public function toggleCommentLike(Request $request, $church_id, $id)
    {
        $request->validate(['liked' => 'required|boolean']);

        $comment = PostComment::where('id', $id)->where('status', 1)->firstOrFail();

        if ($request->boolean('liked')) {
            $comment->increment('public_like_count');
        } else {
            $comment->decrement('public_like_count');
        }

        return response()->json([
            'liked' => $request->boolean('liked'),
            'count' => $comment->fresh()->public_like_count,
        ]);
    }
}
