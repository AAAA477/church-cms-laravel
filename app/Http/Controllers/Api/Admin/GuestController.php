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
 * Guests CRUD for the Next.js admin console (/console/guests).
 *
 * Mirrors app/Http/Controllers/Admin/{GuestsController,GuestAddController,
 * GuestEditController,GuestDetailsController} but as a single JSON resource
 * controller, scoped to the authenticated admin's church_id. Structurally
 * identical to Api\Admin\MemberController — same usergroup_id=5 users, just
 * membership_type='guest' — with a few guest-only profile fields
 * (sub_occupation, aadhar_number, notes) and without member-only fields
 * (family, marriage_status) that don't apply to guests in the legacy panel.
 * City/state/country are required in the legacy GuestAddRequest (India-only
 * assumption); relaxed to optional here, same as Members.
 */
class GuestController extends Controller
{
    use Common, LogActivity, RegisterUser;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $query = User::with('userprofile.city', 'userprofile.state', 'userprofile.country')
            ->where('church_id', $churchId)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', fn ($p) => $p->where('membership_type', 'guest'));

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

        $guests = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($guests->items())->map(fn (User $u) => $this->summarize($u)),
            'meta' => [
                'current_page' => $guests->currentPage(),
                'last_page'    => $guests->lastPage(),
                'total'        => $guests->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $this->findGuest($request, $id, ['userprofile.city', 'userprofile.state', 'userprofile.country']);

        if (! $user) {
            return response()->json(['message' => 'Guest not found'], 404);
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
            'sub_occupation'  => optional($p)->sub_occupation,
            'address'         => optional($p)->address,
            'city_id'         => optional($p)->city_id,
            'state_id'        => optional($p)->state_id,
            'country_id'      => optional($p)->country_id,
            'pincode'         => optional($p)->pincode,
            'aadhar_number'   => optional($p)->aadhar_number,
            'notes'           => optional($p)->notes,
            'status'          => optional($p)->status,
            'membership_type' => optional($p)->membership_type,
            'avatar'          => optional($p)->AvatarPath,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'firstname'      => 'required|string|max:15',
            'lastname'       => 'nullable|string|max:15',
            'gender'         => 'required|in:male,female,transgender',
            'date_of_birth'  => 'required|date',
            'profession'     => 'nullable|in:admin,business,doctor,engineer,government_employee,home_maker,lawyer,pastor,police,professionals,self_employed,student,teacher,others,guest,preacher',
            'sub_occupation' => 'nullable|string|max:15',
            'address'         => 'nullable|string',
            'city_id'        => 'nullable|integer',
            'state_id'       => 'nullable|integer',
            'country_id'     => 'nullable|integer',
            'pincode'        => 'nullable|string|max:10',
            'mobile_no'      => 'required|digits:10|unique:users,mobile_no',
            'email'          => 'nullable|email|unique:users,email',
            'aadhar_number'  => 'nullable|string|max:12',
            'notes'          => 'nullable|string',
            'avatar'         => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        $churchId = $request->user()->church_id;

        $path = '';
        if ($request->hasFile('avatar')) {
            $path = $this->uploadFile("{$churchId}/guest/avatar", $request->file('avatar'));
        }

        $payload = (object) array_merge($data, [
            'membership_type' => 'guest',
            'ref_name'        => null,
            'name'            => null,
        ]);

        $user = $this->CreateUser($payload, $churchId, $path, 5);

        if (! $user) {
            return response()->json(['message' => 'Could not create guest'], 500);
        }

        Cache::forget("guestCount{$churchId}");
        Cache::forget("maleGuestCount{$churchId}");
        Cache::forget("femaleGuestCount{$churchId}");
        Cache::forget("recentMember{$churchId}");

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_GUEST,
            'Guest Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $user->id], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $this->findGuest($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Guest not found'], 404);
        }

        $data = $request->validate([
            'firstname'      => 'sometimes|required|string|max:15',
            'lastname'       => 'nullable|string|max:15',
            'gender'         => 'sometimes|required|in:male,female,transgender',
            'date_of_birth'  => 'sometimes|required|date',
            'profession'     => 'nullable|in:admin,business,doctor,engineer,government_employee,home_maker,lawyer,pastor,police,professionals,self_employed,student,teacher,others,guest,preacher',
            'sub_occupation' => 'nullable|string|max:15',
            'address'         => 'nullable|string',
            'city_id'        => 'nullable|integer',
            'state_id'       => 'nullable|integer',
            'country_id'     => 'nullable|integer',
            'pincode'        => 'nullable|string|max:10',
            'mobile_no'      => 'sometimes|required|digits:10|unique:users,mobile_no,' . $user->id,
            'email'          => 'nullable|email|unique:users,email,' . $user->id,
            'aadhar_number'  => 'nullable|string|max:12',
            'notes'          => 'nullable|string',
        ]);

        $user->fill(array_intersect_key($data, array_flip(['mobile_no', 'email'])));
        $user->save();

        $profile = Userprofile::where('user_id', $user->id)->first();
        $profile->fill(array_diff_key($data, array_flip(['mobile_no', 'email'])));
        $profile->save();

        $this->doActivityLog(
            $profile,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_GUEST,
            'Guest Details Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function status(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:active,inactive,exit']);

        $user = $this->findGuest($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Guest not found'], 404);
        }

        $profile = Userprofile::where('user_id', $user->id)->first();
        $profile->status = $request->status;
        $profile->save();

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
            "Guest status changed to {$request->status}"
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $this->findGuest($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Guest not found'], 404);
        }

        Userprofile::where('user_id', $user->id)->delete();
        $user->delete();

        Cache::forget("guestCount{$user->church_id}");

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_DELETE_MEMBER,
            'Guest Deleted Successfully'
        );

        return response()->json(['success' => true]);
    }

    /** Church- and membership_type-scoped guest lookup, shared by show/update/status/destroy. */
    private function findGuest(Request $request, $id, array $with = []): ?User
    {
        return User::with($with)
            ->where('church_id', $request->user()->church_id)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', fn ($p) => $p->where('membership_type', 'guest'))
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
