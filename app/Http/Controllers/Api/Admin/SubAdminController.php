<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use App\Models\Userprofile;
use App\Traits\Common;
use App\Traits\LogActivity;
use App\Traits\RegisterUser;
use Illuminate\Http\Request;

/**
 * Sub-admin management for the Next.js admin console (/console/subadmins).
 *
 * Mirrors app/Http/Controllers/Admin/SubAdminController, scoped to the
 * authenticated admin's church_id. The legacy controller has no delete or
 * status endpoints for sub-admins (permissions are the only lever — revoke
 * everything instead of deleting the account), so this API matches that:
 * index/show/store/update + permissions get/sync only.
 */
class SubAdminController extends Controller
{
    use Common, LogActivity, RegisterUser;

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        // Admins (3) are listed alongside subadmins (4) so accounts promoted
        // from the Members area stay visible and can be demoted again.
        $query = User::with('userprofile')
            ->where('church_id', $churchId)
            ->whereIn('usergroup_id', [3, 4]);

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

        $subadmins = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => collect($subadmins->items())->map(fn (User $u) => [
                'id'        => $u->id,
                'name'      => trim((optional($u->userprofile)->firstname ?? '') . ' ' . (optional($u->userprofile)->lastname ?? '')) ?: $u->name,
                'email'     => $u->email,
                'mobile_no' => $u->mobile_no,
                'avatar'    => optional($u->userprofile)->AvatarPath,
                'role'      => $u->usergroup_id === 3 ? 'admin' : 'subadmin',
            ]),
            'meta' => [
                'current_page' => $subadmins->currentPage(),
                'last_page'    => $subadmins->lastPage(),
                'total'        => $subadmins->total(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $this->findSubAdmin($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Sub-admin not found'], 404);
        }

        $p = $user->userprofile;

        return response()->json([
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'role'            => $user->usergroup_id === 3 ? 'admin' : 'subadmin',
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
            'notes'           => optional($p)->notes,
            'avatar'          => optional($p)->AvatarPath,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'firstname'     => 'required|string|max:15',
            'lastname'      => 'nullable|string|max:15',
            'gender'        => 'required|in:male,female,transgender',
            'date_of_birth' => 'required|date',
            'profession'    => 'nullable|in:admin,business,doctor,engineer,government_employee,home_maker,lawyer,pastor,police,professionals,self_employed,student,teacher,others,guest,preacher',
            'address'         => 'nullable|string',
            'city_id'       => 'nullable|integer',
            'state_id'      => 'nullable|integer',
            'country_id'    => 'nullable|integer',
            'pincode'       => 'nullable|string|max:10',
            'mobile_no'     => 'required|digits:10|unique:users,mobile_no',
            'email'         => 'nullable|email|unique:users,email',
            'notes'         => 'nullable|string',
            'avatar'        => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        $churchId = $request->user()->church_id;

        $path = '';
        if ($request->hasFile('avatar')) {
            $path = $this->uploadFile("{$churchId}/subadmin/avatar", $request->file('avatar'));
        }

        $payload = (object) array_merge($data, ['ref_name' => null, 'name' => null]);

        $user = $this->CreateUser($payload, $churchId, $path, 4);

        if (! $user) {
            return response()->json(['message' => 'Could not create sub-admin'], 500);
        }

        $this->doActivityLog(
            $user,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_ADD_SUBADMIN,
            'Sub Admin Added Successfully'
        );

        return response()->json(['success' => true, 'id' => $user->id], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $this->findSubAdmin($request, $id);

        if (! $user) {
            return response()->json(['message' => 'Sub-admin not found'], 404);
        }

        $data = $request->validate([
            'firstname'     => 'sometimes|required|string|max:15',
            'lastname'      => 'nullable|string|max:15',
            'gender'        => 'sometimes|required|in:male,female,transgender',
            'date_of_birth' => 'sometimes|required|date',
            'profession'    => 'nullable|in:admin,business,doctor,engineer,government_employee,home_maker,lawyer,pastor,police,professionals,self_employed,student,teacher,others,guest,preacher',
            'address'         => 'nullable|string',
            'city_id'       => 'nullable|integer',
            'state_id'      => 'nullable|integer',
            'country_id'    => 'nullable|integer',
            'pincode'       => 'nullable|string|max:10',
            'notes'         => 'nullable|string',
        ]);

        $profile = Userprofile::where('user_id', $user->id)->first();
        $profile->fill($data);
        $profile->save();

        $this->doActivityLog(
            $profile,
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_SUBADMIN,
            'Sub Admin Details Updated Successfully'
        );

        return response()->json(['success' => true]);
    }

    public function getPermissions(Request $request, $id)
    {
        $user = $this->findSubAdmin($request, $id, true);

        if (! $user) {
            return response()->json(['message' => 'Sub-admin not found'], 404);
        }

        return response()->json([
            'all'      => Permission::orderBy('name')->pluck('name'),
            'assigned' => $user->permissions()->pluck('name'),
        ]);
    }

    public function updatePermissions(Request $request, $id)
    {
        $user = $this->findSubAdmin($request, $id, true);

        if (! $user) {
            return response()->json(['message' => 'Sub-admin not found'], 404);
        }

        $data = $request->validate([
            'permissions'   => 'present|array',
            'permissions.*' => 'string',
        ]);

        $user->syncPermissions($data['permissions']);

        return response()->json(['success' => true]);
    }

    /**
     * Staff lookup. show/update work for admins and subadmins alike (the
     * page lists both); the Laratrust permission endpoints stay
     * subadmin-only via $subadminOnly — admins bypass permissions anyway.
     */
    private function findSubAdmin(Request $request, $id, bool $subadminOnly = false): ?User
    {
        return User::with('userprofile')
            ->where('church_id', $request->user()->church_id)
            ->whereIn('usergroup_id', $subadminOnly ? [4] : [3, 4])
            ->find($id);
    }
}
