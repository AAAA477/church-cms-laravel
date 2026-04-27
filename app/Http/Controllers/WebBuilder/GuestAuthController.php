<?php

namespace App\Http\Controllers\WebBuilder;

use App\Http\Controllers\Controller;
use App\Traits\RegisterUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GuestAuthController extends Controller
{
    use RegisterUser;

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('web.home');
        }

        if (config('settings.guest_registration', 1) != 1) {
            return view('theme::guest_register', ['blocked' => true]);
        }

        return view('theme::guest_register', ['blocked' => false]);
    }

    public function register(Request $request)
    {
        if (Auth::check()) {
            return redirect()->route('web.home');
        }

        if (config('settings.guest_registration', 1) != 1) {
            return redirect()->route('web.guest.register');
        }

        $request->validate([
            'firstname'             => 'required|string|alpha|max:50',
            'lastname'              => 'nullable|string|alpha|max:50',
            'gender'                => 'required|in:male,female,other',
            'date_of_birth'         => 'required|date|before:today|after:1920-01-01',
            'mobile_no'             => 'required|digits:10|unique:users,mobile_no',
            'email'                 => 'required|email|max:150|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $church = $request->attributes->get('_church');

        $data = (object) [
            'name'           => trim($request->firstname . ' ' . ($request->lastname ?? '')),
            'firstname'      => $request->firstname,
            'lastname'       => $request->lastname,
            'gender'         => $request->gender,
            'date_of_birth'  => $request->date_of_birth,
            'mobile_no'      => $request->mobile_no,
            'email'          => $request->email,
            'ref_name'       => null,
            'was_baptized'   => null,
            'baptism_date'   => null,
            'profession'     => null,
            'sub_occupation' => null,
            'address'        => null,
            'city_id'        => null,
            'state_id'       => null,
            'country_id'     => null,
            'pincode'        => null,
            'aadhar_number'  => null,
            'notes'          => null,
        ];

        $user = $this->createGuest($data, optional($church)->id ?? 0, '', 5);

        if (!$user) {
            return back()->withErrors(['error' => 'Registration failed. Please try again.'])->withInput();
        }

        $user->password = bcrypt($request->password);
        $user->save();

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('web.prayer'))
            ->with('success', 'Welcome! You are now registered. You can now submit prayer requests, help requests, and comments.');
    }

    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('web.home');
        }

        return view('theme::guest_login', [
            'guestLoginBlocked'  => config('settings.guest_login', 1) != 1,
            'memberLoginBlocked' => config('settings.member_web_login', 1) != 1,
        ]);
    }

    public function login(Request $request)
    {
        if (config('settings.guest_login', 1) != 1) {
            return redirect()->route('web.guest.login');
        }
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('web.prayer'));
        }

        return back()->withErrors([
            'email' => 'These credentials do not match our records.',
        ])->withInput($request->only('email', 'remember'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('web.home');
    }
}
