<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GroupLink;
use App\Models\User;
use App\Models\Userprofile;
use App\Traits\Common;
use App\Traits\LogActivity;
use App\Traits\RegisterUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Members CRUD for the Next.js admin console (/console/members).
 *
 * Mirrors app/Http/Controllers/Admin/{UserController,MemberAddController,
 * MemberEditController} but as a single JSON resource controller, scoped
 * to the authenticated admin's church_id (never trusts a client-supplied
 * church id). The India-specific "required" quirks in the legacy
 * UserProfileAddRequest (6-digit pincode, Aadhaar number, mandatory
 * city/state/country) are relaxed to optional here — this console serves
 * churches outside India too.
 */
class MemberController extends Controller
{
    use Common, LogActivity, RegisterUser;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = User::with('userprofile.city', 'userprofile.state', 'userprofile.country')
            ->where('church_id', $churchId)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', fn ($p) => $p->where('membership_type', 'member'));

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('mobile_no', 'like', "%{$search}%")
                    ->orWhereHas('userprofile', function ($p) use ($search) {
                        $p->where('firstname', 'like', "%{$search}%")
                            ->orWhere('lastname', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->query('status')) {
            $query->whereHas('userprofile', fn ($p) => $p->where('status', $status));
        }

        $members = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($members->items())->map(fn (User $u) => $this->summarize($u)),
            'meta' => [
                'current_page' => $members->currentPage(),
                'last_page'    => $members->lastPage(),
                'total'        => $members->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $this->findMember($request, $id, ['userprofile.city', 'userprofile.state', 'userprofile.country']);

        if (! $user) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $p = $user->userprofile;

        return response()->json([
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'mobile_no'       => $user->mobile_no,
            'firstname'       => optional($p)->firstname,
            'lastname'        => optional($p)->lastname,
            'gender'          => optional($p)->gender,
            'date_of_birth'   => optional($p)->date_of_birth,
            'profession'      => optional($p)->profession,
            'address'         => optional($p)->address,
            'city_id'         => optional($p)->city_id,
            'state_id'        => optional($p)->state_id,
            'country_id'      => optional($p)->country_id,
            'pincode'         => optional($p)->pincode,
            'family'          => optional($p)->family,
            'marriage_status' => optional($p)->marriage_status,
            'preferred_channel' => optional($p)->preferred_channel,
            'relation'        => optional($p)->relation,
            'status'          => optional($p)->status,
            'membership_type' => optional($p)->membership_type,
            'avatar'          => optional($p)->AvatarPath,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'firstname'       => 'required|string|max:15',
            'lastname'        => 'nullable|string|max:15',
            'gender'          => 'required|in:male,female,transgender',
            'date_of_birth'   => 'required|date',
            'profession'      => 'nullable|in:admin,business,doctor,engineer,government_employee,home_maker,lawyer,pastor,police,professionals,self_employed,student,teacher,others,guest,preacher',
            'address'         => 'nullable|string',
            'city_id'         => 'nullable|integer',
            'state_id'        => 'nullable|integer',
            'country_id'      => 'nullable|integer',
            'pincode'         => 'nullable|string|max:10',
            'mobile_no'       => 'required|digits:10|unique:users,mobile_no',
            'email'           => 'nullable|email|unique:users,email',
            'family'          => 'nullable|string|max:15',
            'marriage_status' => 'nullable|in:single,married,ended_by_death,ended_by_divorce,separated',
            'preferred_channel' => 'nullable|in:email,phone,sms,whatsapp',
            'relation'        => 'nullable|in:head,partner,child,father,mother,sibling,other',
            'avatar'          => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        $churchId = $request->user()->church_id;

        $path = '';
        if ($request->hasFile('avatar')) {
            $path = $this->uploadFile("{$churchId}/member/avatar", $request->file('avatar'));
        }

        $payload = (object) array_merge($data, [
            'membership_type' => 'member',
            'ref_name'        => null,
            'name'            => null,
        ]);

        $user = $this->CreateUser($payload, $churchId, $path, 5);

        if (! $user) {
            return response()->json(['message' => 'Could not create member'], 500);
        }

        Cache::forget("memberCount{$churchId}");
        Cache::forget("maleMemberCount{$churchId}");
        Cache::forget("femaleMemberCount{$churchId}");
        Cache::forget("recentMember{$churchId}");

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_MEMBER,
            'Member Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $user->id], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $this->findMember($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $data = $request->validate([
            'firstname'       => 'sometimes|required|string|max:15',
            'lastname'        => 'nullable|string|max:15',
            'gender'          => 'sometimes|required|in:male,female,transgender',
            'date_of_birth'   => 'sometimes|required|date',
            'profession'      => 'nullable|in:admin,business,doctor,engineer,government_employee,home_maker,lawyer,pastor,police,professionals,self_employed,student,teacher,others,guest,preacher',
            'address'         => 'nullable|string',
            'city_id'         => 'nullable|integer',
            'state_id'        => 'nullable|integer',
            'country_id'      => 'nullable|integer',
            'pincode'         => 'nullable|string|max:10',
            'mobile_no'       => 'sometimes|required|digits:10|unique:users,mobile_no,' . $user->id,
            'email'           => 'nullable|email|unique:users,email,' . $user->id,
            'family'          => 'nullable|string|max:15',
            'marriage_status' => 'nullable|in:single,married,ended_by_death,ended_by_divorce,separated',
            'preferred_channel' => 'nullable|in:email,phone,sms,whatsapp',
            'relation'        => 'nullable|in:head,partner,child,father,mother,sibling,other',
        ]);

        $user->fill(array_intersect_key($data, array_flip(['mobile_no', 'email'])));
        $user->save();

        $profile = Userprofile::where('user_id', $user->id)->first();
        // preferred_channel and relation aren't in Userprofile::$fillable
        // (see RegisterUser::CreateUser) — fill() silently drops them, so
        // assign as raw properties like the rest of this codebase does.
        $profile->fill(array_diff_key($data, array_flip(['mobile_no', 'email', 'preferred_channel', 'relation'])));
        if (array_key_exists('preferred_channel', $data)) {
            $profile->preferred_channel = $data['preferred_channel'];
        }
        if (array_key_exists('relation', $data)) {
            $profile->relation = $data['relation'];
        }
        $profile->save();

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_MEMBER,
            'Member Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function status(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:active,inactive,exit']);

        $user = $this->findMember($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $profile = Userprofile::where('user_id', $user->id)->first();
        $profile->status = $request->status;
        $profile->save();

        // Exiting a member removes them from any groups + group-specific
        // permissions, matching UserController@exitStore's cleanup.
        if ($request->status === 'exit') {
            $groupLinks = GroupLink::where('user_id', $user->id)->get();
            foreach ($groupLinks as $link) {
                $link->delete();
            }
        }

        $this->doActivityLog(
            $profile,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_MEMBER_STATUS,
            "Member status changed to {$request->status}"
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $this->findMember($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        Userprofile::where('user_id', $user->id)->delete();
        $user->delete();

        Cache::forget("memberCount{$user->church_id}");

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_MEMBER,
            'Member Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    /**
     * Change a user's role: member (5) <-> subadmin (4) <-> admin (3).
     * Full admins only — subadmins must never be able to raise their own
     * (or anyone's) privileges. Guests must be converted to members first.
     */
    public function role(Request $request, $id)
    {
        if ($request->user()->usergroup_id !== 3) {
            return response()->json(['message' => 'Only a full admin can change roles'], 403);
        }

        $data = $request->validate([
            'role' => 'required|in:admin,subadmin,member',
        ]);

        if ((int) $id === $request->user()->id) {
            return response()->json(['message' => 'You cannot change your own role'], 422);
        }

        $user = User::with('userprofile')
            ->where('church_id', $request->user()->church_id)
            ->whereIn('usergroup_id', [3, 4, 5])
            ->find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->usergroup_id === 5 && optional($user->userprofile)->membership_type !== 'member') {
            return response()->json(['message' => 'Convert this guest to a member before assigning a role'], 422);
        }

        $target = ['admin' => 3, 'subadmin' => 4, 'member' => 5][$data['role']];

        // Never demote the church's last full admin — the console would
        // have nobody left who can manage roles.
        if ($user->usergroup_id === 3 && $target !== 3) {
            $otherAdmins = User::where('church_id', $user->church_id)
                ->where('usergroup_id', 3)
                ->where('id', '!=', $user->id)
                ->count();
            if ($otherAdmins === 0) {
                return response()->json(['message' => 'This is the only admin — promote someone else first'], 422);
            }
        }

        $user->usergroup_id = $target;
        $user->save();

        // Api\Admin\AuthController@login (and the matching upgrade-admin
        // endpoint) require membership_type === 'member' for usergroup 3 —
        // subadmins created via "Add Sub-Admin" never get membership_type
        // set at all, so promoting one straight to admin without this
        // would silently lock them out of the console with no visible
        // error until they specifically try to log in there.
        if ($target === 3 && optional($user->userprofile)->membership_type !== 'member') {
            $user->userprofile->membership_type = 'member';
            $user->userprofile->save();
        }

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_MEMBER,
            "User Role Changed To {$data['role']} Successfully"
        );

        return response()->json(['success' => true, 'role' => $data['role']]);
    }

    /** Church- and membership_type-scoped member lookup, shared by show/update/status/destroy. */
    private function findMember(Request $request, $id, array $with = []): ?User
    {
        return User::with($with)
            ->where('church_id', $request->user()->church_id)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', fn ($p) => $p->where('membership_type', 'member'))
            ->find($id);
    }

    private function summarize(User $user): array
    {
        $p = $user->userprofile;

        return [
            'id'        => $user->id,
            'name'      => trim(($p->firstname ?? '') . ' ' . ($p->lastname ?? '')) ?: $user->name,
            'email'     => $user->email,
            'mobile_no' => $user->mobile_no,
            'gender'    => optional($p)->gender,
            'status'    => optional($p)->status,
            'city'      => optional(optional($p)->city)->name,
            'avatar'    => optional($p)->AvatarPath,
        ];
    }
}
