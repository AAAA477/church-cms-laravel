<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Blog posts CRUD for the Next.js admin console (/console/posts). Mirrors
 * app/Http/Controllers/Admin/{PostAddController,PostEditController,
 * PostsController}'s core flow — tags and comment moderation
 * (PostComments/PostReplyComments/PostCommentDetails) are deferred as a
 * separate, self-contained follow-up, same reasoning as CampaignEmail.
 */
class PostController extends Controller
{
    use Common, LogActivity;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        // No default entity_name filter — the legacy admin lists every post
        // unless an entity filter is explicitly requested, and seeded/blog
        // posts carry entity_name NULL.
        $query = Post::with('category')->where('church_id', $churchId);

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $posts = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($posts->items())->map(fn (Post $p) => $this->summarize($p)),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'total'        => $posts->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $post = $this->findPost($request, $id);

        if (! $post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json($this->summarize($post));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:post_categories,id',
            'description' => 'required|string',
            'post_later'  => 'nullable|boolean',
            'posted_at'   => 'required_if:post_later,true|nullable|date',
        ]);

        $post = new Post;
        $post->church_id = $request->user()->church_id;
        $post->entity_id = $request->user()->id;
        $post->entity_name = 'App\Models\User';
        $post->title = $data['title'] ?? null;
        $post->category_id = $data['category_id'] ?? null;
        $post->description = $data['description'];

        if (! empty($data['post_later']) && ! empty($data['posted_at'])) {
            $post->post_created_at = $data['posted_at'];
            $post->is_posted = false;
            $post->status = 'pending';
        } else {
            $post->post_created_at = now();
            $post->posted_at = now();
            $post->is_posted = true;
            $post->status = 'posted';
        }

        $post->created_by = $request->user()->id;
        $post->save();

        $this->doActivityLog(
            $post,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_POST,
            'Post Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $post->id], 201);
    }

    public function update(Request $request, $id)
    {
        $post = $this->findPost($request, $id);

        if (! $post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $data = $request->validate([
            'title'       => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:post_categories,id',
            'description' => 'sometimes|required|string',
        ]);

        $post->fill($data);
        $post->save();

        $this->doActivityLog(
            $post,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_POST,
            'Post Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $post = $this->findPost($request, $id);

        if (! $post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $post->delete();

        $this->doActivityLog(
            $post,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_POST,
            'Post Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    private function findPost(Request $request, $id): ?Post
    {
        return Post::with('category')->where('church_id', $request->user()->church_id)->find($id);
    }

    private function summarize(Post $p): array
    {
        return [
            'id'          => $p->id,
            'title'       => $p->title,
            'description' => $p->description,
            'category_id' => $p->category_id,
            'category'    => optional($p->category)->name,
            'status'      => $p->status,
            'is_posted'   => (bool) $p->is_posted,
            'posted_at'   => $p->posted_at,
            'created_at'  => $p->created_at,
        ];
    }
}
