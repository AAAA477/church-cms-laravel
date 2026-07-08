<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Userprofile;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Own-account profile management (avatar/password) for the Next.js admin
 * console. Mirrors app/Http/Controllers/Admin/UserProfileController's
 * avatar and password flows — `/api/admin/me` (Api\Admin\AuthController)
 * already covers reading the current admin's identity, so this only adds
 * the two mutations.
 */
class ProfileController extends Controller
{
    use Common, LogActivity;

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'oldpassword' => 'required|string',
            'newpassword' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($data['oldpassword'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($data['newpassword']);
        $user->save();

        $this->doActivityLog(
            $user,
            $user,
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_CHANGE_PASSWORD,
            'Changed Profile Password.'
        );

        return response()->json(['success' => true]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate(['avatar' => 'required|image|mimes:jpg,jpeg,png,webp']);

        $user = $request->user();
        $profile = Userprofile::where('user_id', $user->id)->first();

        $path = $this->uploadFile("{$user->church_id}/avatars", $request->file('avatar'));
        $profile->avatar = $path;
        $profile->save();

        $this->doActivityLog(
            $profile,
            $user,
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_CHANGE_AVATAR,
            'Changed Avatar'
        );

        return response()->json(['success' => true, 'avatar' => $profile->AvatarPath]);
    }
}
