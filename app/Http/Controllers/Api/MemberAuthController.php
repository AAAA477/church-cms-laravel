<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Church;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Email + password authentication for the Next.js member portal.
 *
 * Separate from LoginController@login (mobile_no + password, built for the
 * mobile app) because that endpoint deletes ALL of a user's tokens on every
 * login — logging a member into the web portal would silently kill their
 * mobile app session. This controller only ever touches its own
 * "web-portal" named tokens.
 */
class MemberAuthController extends Controller
{
    private const TOKEN_NAME = 'web-portal';

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // Members (5), and also church admins (3) / subadmins (4) so staff
        // can use the public site under one login — the Next.js layer
        // additionally gives them an admin console session (see
        // frontend/src/app/bff/auth/login).
        $user = User::where('email', $request->email)
            ->whereIn('usergroup_id', [3, 4, 5])
            ->with('userprofile')
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (! $user->userprofile || $user->userprofile->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This account is not active. Please contact your church admin.',
            ], 403);
        }

        $user->tokens()->where('name', self::TOKEN_NAME)->delete();
        $token = $user->createToken(self::TOKEN_NAME)->plainTextToken;

        return response()->json([
            'success'  => true,
            'token'    => $token,
            'user'     => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'usergroup_id' => $user->usergroup_id,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['success' => true, 'message' => 'Logged out']);
    }

    /**
     * Mints an admin-portal session for a member-portal session belonging
     * to an account that IS a church admin/subadmin right now, without
     * requiring the password again — identity is already proven by the
     * member_token bearer. Exists because being promoted to admin/subadmin
     * doesn't retroactively touch an already-open member session (the
     * admin_token cookie is normally only set at login time); the "Admin
     * Console" link calls this first so it always works on the first
     * click, whether the account was promoted before or after this login.
     *
     * Mirrors Api\Admin\AuthController@login's eligibility checks exactly
     * (minus the password, and using the live usergroup_id/status instead
     * of re-querying by email) so this can never grant access login itself
     * would refuse.
     */
    public function upgradeToAdmin(Request $request)
    {
        $user = $request->user()->load('userprofile');

        if (! in_array($user->usergroup_id, [3, 4], true)) {
            return response()->json(['success' => false, 'message' => 'Not an admin account'], 403);
        }

        if (! Church::IsActive($user->church_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Contact Church Admin for more details'], 403);
        }

        $status = optional($user->userprofile)->status;

        if ($status === 'inactive') {
            return response()->json(['success' => false, 'message' => 'You are suspended by site admin'], 403);
        }

        if ($status === 'exit') {
            return response()->json(['success' => false, 'message' => 'You have exited this church'], 403);
        }

        if ($user->usergroup_id == 3 && $status !== null && optional($user->userprofile)->membership_type !== 'member') {
            return response()->json(['success' => false, 'message' => 'Invalid Credentials. This account is not allowed to login.'], 403);
        }

        $user->tokens()->where('name', 'admin-portal')->delete();
        $token = $user->createToken('admin-portal')->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
