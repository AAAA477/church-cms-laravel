<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Church;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Email + password authentication for the Next.js admin console.
 *
 * Mirrors the validation rules in app/Traits/AuthenticatesUsers.php (the
 * session-based login used by the Blade admin panel) so the same accounts
 * work the same way here, but issues a Sanctum token instead of a session
 * — and only ever touches its own "admin-portal" named tokens, so signing
 * into the console never disturbs a member-portal or mobile-app session
 * for the same user.
 */
class AuthController extends Controller
{
    private const TOKEN_NAME = 'admin-portal';

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
            ->whereIn('usergroup_id', [3, 4]) // ChurchAdmin or ChurchSubadmin
            ->with('userprofile')
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (! Church::IsActive($user->church_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Contact Church Admin for more details',
            ], 403);
        }

        $status = optional($user->userprofile)->status;

        if ($status === 'inactive') {
            return response()->json([
                'success' => false,
                'message' => 'You are suspended by site admin',
            ], 403);
        }

        if ($status === 'exit') {
            return response()->json([
                'success' => false,
                'message' => 'You have exited this church',
            ], 403);
        }

        // ChurchAdmin (3) additionally requires membership_type === 'member',
        // matching checkLoginAllowed() in AuthenticatesUsers exactly.
        if ($user->usergroup_id == 3 && $status !== null && optional($user->userprofile)->membership_type !== 'member') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Credentials. This account is not allowed to login.',
            ], 403);
        }

        $user->tokens()->where('name', self::TOKEN_NAME)->delete();
        $token = $user->createToken(self::TOKEN_NAME)->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
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
     * The authenticated admin/subadmin's identity + permission set, used by
     * the Next.js console to gate pages and nav items the same way the
     * Blade sidebar does with `$isAdmin || $user->hasPermission(...)`.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->usergroup_id == 3;

        return response()->json([
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'usergroup_id' => $user->usergroup_id,
            'is_admin'     => $isAdmin,
            // Admins bypass all permission checks (mirrors AdminOrPermission
            // middleware + the Gate::before shortcut) — the console can
            // just check is_admin instead of scanning this list for them.
            'permissions'  => $isAdmin ? [] : $user->permissions()->pluck('name'),
        ]);
    }
}
