<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupCategory;
use App\Models\GroupLink;
use App\Models\PermissionUser;
use App\Models\SendMail;
use App\Models\User;
use App\Traits\Common;
use App\Traits\LogActivity;
use App\Traits\SendMessageProcess;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Groups CRUD for the Next.js admin console (/console/groups).
 *
 * Mirrors app/Http/Controllers/Admin/{GroupsController,GroupLinksController}
 * as a single JSON resource controller, scoped to the authenticated admin's
 * church_id. `cover_image` is required in the legacy GroupAddRequest;
 * relaxed to optional here, same relaxation applied to Members/Guests.
 */
class GroupController extends Controller
{
    use Common, LogActivity, SendMessageProcess;

    public function categories()
    {
        return response()->json(GroupCategory::where('status', 'active')->get(['id', 'name']));
    }

    public function index(Request $request)
    {
        $query = Group::with('groupCategory')->where('church_id', $request->user()->church_id);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $groups = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($groups->items())->map(fn (Group $g) => [
                'id'           => $g->id,
                'name'         => $g->name,
                'category'     => optional($g->groupCategory)->name,
                'group_type'   => $g->group_type,
                'cover_image'  => $g->cover_image,
                'member_count' => GroupLink::where('group_id', $g->id)->count(),
            ]),
            'meta' => [
                'current_page' => $groups->currentPage(),
                'last_page'    => $groups->lastPage(),
                'total'        => $groups->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $group = $this->findGroup($request, $id, ['groupCategory']);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        return response()->json([
            'id'           => $group->id,
            'name'         => $group->name,
            'description'  => $group->description,
            'category_id'  => $group->category_id,
            'category'     => optional($group->groupCategory)->name,
            'group_type'   => $group->group_type,
            'cover_image'  => $group->cover_image,
            'member_count' => GroupLink::where('group_id', $group->id)->count(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:30',
            'description' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:group_category,id',
            'group_type'  => 'required|in:common_interests,everyone,married_couples,men,women,young_adults,youth',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,bmp',
        ]);

        $churchId = $request->user()->church_id;

        $group = new Group;
        $group->church_id = $churchId;
        $group->category_id = $data['category_id'];
        $group->group_type = $data['group_type'];
        $group->name = $data['name'];
        $group->description = $data['description'];
        $group->created_by = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $group->cover_image = $this->uploadFile("{$churchId}/groups/cover_image", $request->file('cover_image'));
        }

        $group->save();

        $this->doActivityLog(
            $group,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_GROUP,
            'Group Created Successfully'
        );

        return response()->json(['success' => true, 'id' => $group->id], 201);
    }

    public function update(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:30',
            'description' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|integer|exists:group_category,id',
            'group_type'  => 'sometimes|required|in:common_interests,everyone,married_couples,men,women,young_adults,youth',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,bmp',
        ]);

        $group->fill($data);

        if ($request->hasFile('cover_image')) {
            $group->cover_image = $this->uploadFile("{$group->church_id}/groups/cover_image", $request->file('cover_image'));
        }

        $group->save();

        $this->doActivityLog(
            $group,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_GROUP,
            'Group Details Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $groupLinks = GroupLink::where('group_id', $group->id)->get();
        foreach ($groupLinks as $link) {
            PermissionUser::where('user_id', $link->user_id)->delete();
            $link->delete();
        }
        $group->delete();

        $this->doActivityLog(
            $group,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_GROUP,
            'Group Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function members(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $links = GroupLink::with('user.userprofile')->where('group_id', $group->id)->paginate(20);

        return response()->json([
            'data' => collect($links->items())->map(fn (GroupLink $link) => [
                'link_id' => $link->id,
                'user_id' => $link->user_id,
                'name'    => trim((optional($link->user->userprofile)->firstname ?? '') . ' ' . (optional($link->user->userprofile)->lastname ?? '')) ?: optional($link->user)->name,
                'email'   => optional($link->user)->email,
                'role'    => $link->role,
            ]),
            'meta' => [
                'current_page' => $links->currentPage(),
                'last_page'    => $links->lastPage(),
                'total'        => $links->total(),
            ],
        ]);
    }

    public function availableMembers(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $existingUserIds = GroupLink::where('group_id', $group->id)->pluck('user_id');

        $query = User::where('church_id', $request->user()->church_id)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', fn ($p) => $p->where('membership_type', 'member')->where('status', 'active'))
            ->whereNotIn('id', $existingUserIds);

        if ($search = $request->query('search')) {
            $query->whereHas('userprofile', function ($p) use ($search) {
                $p->where('firstname', 'like', "%{$search}%")->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        $users = $query->with('userprofile')->limit(20)->get();

        return response()->json($users->map(fn (User $u) => [
            'id'   => $u->id,
            'name' => trim((optional($u->userprofile)->firstname ?? '') . ' ' . (optional($u->userprofile)->lastname ?? '')) ?: $u->name,
        ]));
    }

    public function addMembers(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $data = $request->validate([
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'integer',
            'role'       => 'required|in:group_admin,member,guest',
        ]);

        $added = 0;
        $skipped = 0;

        foreach ($data['user_ids'] as $userId) {
            $exists = GroupLink::where('church_id', $group->church_id)
                ->where('user_id', $userId)
                ->where('group_id', $group->id)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            $link = new GroupLink;
            $link->church_id = $group->church_id;
            $link->user_id = $userId;
            $link->group_id = $group->id;
            $link->role = $data['role'];
            $link->save();

            $this->doActivityLog(
                $link,
                $request->user(),
                ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
                LOGNAME_ADD_MEMBER_TO_GROUP,
                'Member Added to Group Successfully'
            );

            $added++;
        }

        return response()->json(['success' => true, 'added' => $added, 'skipped' => $skipped]);
    }

    public function updateMemberRole(Request $request, $id, $linkId)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $data = $request->validate(['role' => 'required|in:group_admin,member,guest']);

        $link = GroupLink::where('group_id', $group->id)->find($linkId);

        if (! $link) {
            return response()->json(['message' => 'Group member not found'], 404);
        }

        $link->role = $data['role'];
        $link->save();

        $this->doActivityLog(
            $link,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_UPDATE_MEMBER_PERMISSION,
            'Group member role updated'
        );

        return response()->json(['success' => true]);
    }

    public function removeMember(Request $request, $id, $linkId)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $link = GroupLink::where('group_id', $group->id)->find($linkId);

        if (! $link) {
            return response()->json(['message' => 'Group member not found'], 404);
        }

        $link->delete();

        $this->doActivityLog(
            $link,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_REMOVE_GROUP_MEMBER,
            'Member removed from Group Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function message(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $data = (object) $request->validate([
            'mode'    => 'required|in:mail,sms,notification',
            'subject' => 'required_if:mode,mail|nullable|string|max:30',
            'message' => 'required|string|max:1000',
        ]);
        $data->entity_id = null;
        $data->entity_name = null;
        $data->attachments = null;
        $data->executed_at = null;

        $links = GroupLink::where('group_id', $group->id)->get();
        $batchId = (string) Str::uuid();
        $sent = 0;

        foreach ($links as $link) {
            $user = User::find($link->user_id);
            if (! $user) {
                continue;
            }

            $data->entity_id = $group->id;
            $data->entity_name = Group::class;

            $this->sendMessage($data, $group->church_id, $request->user()->email, $user, $request->user(), $batchId);
            $sent++;
        }

        return response()->json(['success' => true, 'sent' => $sent]);
    }

    public function messages(Request $request, $id)
    {
        $group = $this->findGroup($request, $id);

        if (! $group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $messages = SendMail::where('entity_id', $id)
            ->where('entity_name', Group::class)
            ->where('church_id', $group->church_id)
            ->orderByDesc('executed_at')
            ->paginate(15);

        return response()->json([
            'data' => collect($messages->items())->map(fn (SendMail $m) => [
                'id'      => $m->id,
                'mode'    => $m->mode,
                'subject' => $m->subject,
                'message' => $m->message,
                'sent_at' => $m->executed_at,
            ]),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
            ],
        ]);
    }

    private function findGroup(Request $request, $id, array $with = []): ?Group
    {
        return Group::with($with)->where('church_id', $request->user()->church_id)->find($id);
    }
}
