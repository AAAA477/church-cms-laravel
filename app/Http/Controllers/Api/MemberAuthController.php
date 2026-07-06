<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $user = User::where('email', $request->email)
            ->where('usergroup_id', 5) // member
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
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['success' => true, 'message' => 'Logged out']);
    }
}
