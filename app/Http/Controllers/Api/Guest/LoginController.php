<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Requests\Api\Guest\GuestAddRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use App\Traits\RegisterUser;
use App\Models\Userprofile;
use App\Traits\LogActivity;
use App\Traits\Common;
use App\Models\Church;
use App\Models\User;
use Exception;
use Log;

class LoginController extends Controller
{
    use RegisterUser;
    use LogActivity;
    use Common;

    public $successStatus = 200;

    public $failStatus = 302;

    /**
     * login api
     *
     * @return \Illuminate\Http\Response
     */
    public function login(LoginRequest $request)
    {
        try {
            if (Auth::attempt(['mobile_no' => request('email'), 'password' => request('password')])) {
                $user = Auth::user();

                $userprofile = Userprofile::where('user_id', $user->id)->first();
                if ($userprofile->status === 'active') {
                    $token = $user->createToken("churchcms")->plainTextToken;


                    $user = User::where([['id', $user->id], ['church_id', $user->church_id]])->first();

                    $user->platform_token = $request->platform_token;

                    $user->save();

                    return response()->json([
                        'status'            => 'success',
                        'token'             =>  $token,
                        'id'                =>  $user->id,
                        'church_id'         =>  $user->church_id,
                        'user_email'        =>  $user->email,
                        'user_name'         =>  $user->name,
                        'user_fullname'     =>  $user->FullName,
                        'membership_type'   =>  $user->userprofile->membership_type,
                    ], $this->successStatus);
                }
            }
        } catch (Exception $e) {
            Log::info($e->getMessage());
        }
    }

    public function logout(Request $request)
    {
        try {
            if (Auth::check()) {
                Auth()->user()->tokens()->delete();
            }

            $user = User::where('id', Auth::id())->first();

            $user->platform_token  = NULL;

            $user->save();

            return response()->json([
                'success'   =>  true,
                'message'   =>  'Logged out successfully'
            ], 200);
        } catch (Exception $e) {
            Log::info($e->getMessage());
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $array['data'][0]['id']     = 'male';
        $array['data'][0]['name']   = 'Male';
        $array['data'][1]['id']     = 'female';
        $array['data'][1]['name']   = 'Female';

        return $array;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(GuestAddRequest $request)
    {
        //
        try {
            $church = Church::where('id', $request->church_id)->first();
            $path = '';
            $user = $this->createGuest($request, $church->id, $path, 5);

            // createGuest() sets a shared placeholder password; overwrite it
            // with the password the user actually chose (same as the web
            // registration flow in WebBuilder\GuestAuthController@register).
            $user->password = bcrypt($request->password);
            $user->save();

            // Fields createGuest() doesn't handle. relation and
            // preferred_channel aren't in Userprofile::$fillable — assign
            // as properties (same pattern as the household flow below).
            if ($request->filled('relation') || $request->filled('preferred_channel')) {
                $profile = Userprofile::where('user_id', $user->id)->first();
                if ($profile) {
                    if ($request->filled('relation')) {
                        $profile->relation = $request->input('relation');
                    }
                    if ($request->filled('preferred_channel')) {
                        $profile->preferred_channel = $request->input('preferred_channel');
                    }
                    $profile->save();
                }
            }

            $this->createHousehold($request, $user, $church->id);

            $message = 'Guest Added Successfully';

            $ip = $this->getRequestIP();
            $this->doActivityLog(
                $user,
                $user,
                ['ip' => $ip, 'details' => $_SERVER['HTTP_USER_AGENT']],
                LOGNAME_ADD_GUEST,
                $message
            );

            return response()->json([
                'success'   =>  true,
                'message'   =>  'You Are Added To This Church Successfully',
                'user_id'   =>  $user->id,
            ], 200);
        } catch (Exception $e) {
            Log::info($e->getMessage());
        }
    }

    /**
     * Household members registered alongside the registrant: each becomes
     * a user linked to the head of household via ref_id, with the
     * relationship on the profile — the same shape the admin console's
     * member management and DummyFamilySeeder use. They get no login
     * credentials of their own (random password, no email required);
     * admins can grant access later.
     */
    private function createHousehold(GuestAddRequest $request, User $head, int $churchId): void
    {
        $household = $request->validate([
            'household'                   => 'nullable|array|max:15',
            'household.*.firstname'       => 'required|string|max:50',
            'household.*.lastname'        => 'nullable|string|max:50',
            'household.*.gender'          => 'required|in:male,female',
            'household.*.date_of_birth'   => 'required|date|before:tomorrow',
            'household.*.relation'        => 'required|in:partner,child,father,mother,sibling,other',
            'household.*.mobile_no'       => 'nullable|digits:10',
        ])['household'] ?? [];

        $headLastname = optional($head->userprofile)->lastname ?? '';

        foreach ($household as $i => $member) {
            $person = new User;
            $person->church_id    = $churchId;
            $person->usergroup_id = 5;
            $person->ref_id       = $head->id;
            $person->name         = strtolower($member['firstname']) . rand(1000, 9999);
            $person->email        = null;
            // mobile_no is NOT NULL; use a per-household placeholder when
            // no number is given (no unique index on the column).
            $person->mobile_no    = $member['mobile_no'] ?? '000' . str_pad((string) $head->id, 4, '0', STR_PAD_LEFT) . str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            $person->password     = bcrypt(\Illuminate\Support\Str::random(32));
            $person->save();

            $profile = new Userprofile;
            $profile->church_id       = $churchId;
            $profile->user_id         = $person->id;
            $profile->firstname       = $member['firstname'];
            $profile->lastname        = $member['lastname'] ?? $headLastname;
            $profile->gender          = $member['gender'];
            $profile->date_of_birth   = $member['date_of_birth'];
            // 'relation' is not in $fillable, so assign it directly.
            $profile->relation        = $member['relation'];
            $profile->family          = $member['relation'];
            $profile->membership_type = 'guest';
            $profile->save();
        }
    }
}
