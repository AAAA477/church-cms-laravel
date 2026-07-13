<?php

namespace App\Http\Requests\Api\Guest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use App\Models\Userprofile;
use App\Models\User;

class GuestAddRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        Validator::extend('check_unique_email',function($attribute,$value,$parameters,$validator)
        {
            $user=User::where('email','LIKE','%'.request('email').'%')->exists();
            if($user)
            {
                return false;
            }
            return true;
        });

        Validator::extend('check_unique_mobile',function($attribute,$value,$parameters,$validator)
        {
            $user=User::where('mobile_no','=',request('mobile_no'))->exists();
            if($user)
            {
                return false;
            }
            return true;
        });

        Validator::extend('check_date_of_birth',function($attribute,$value,$parameters,$validator)
        { 
            $date_of_birth = date('Y-m-d',strtotime(request('date_of_birth')));
            if( ( $date_of_birth <= date('Y-m-d') ) && ( $date_of_birth >= "1920-01-01" ) )
            {
                return true;
            }
                
            return false;
        });

        Validator::extend('check_firstname',function($attribute,$value,$parameters,$validator)
        {
            return preg_match('/^[A-Za-z\s]+$/', request('firstname')) ;
        });

        return [
            //
            'church_id'         =>  'required',
            'firstname'         =>  'required|check_firstname|max:15',
            'lastname'          =>  'nullable|string|max:15',
            'gender'            =>  'required',
            'date_of_birth'     =>  'required|date|check_date_of_birth',
            'mobile_no'         =>  'required|numeric|digits:10|check_unique_mobile',
            'email'             =>  'required|email|check_unique_email',
            'password'          =>  'required|string|min:8|confirmed',

            // Extended registration fields (2026-07-12/13) — mirrors the
            // register form: preferred contact method and full address are
            // required, matching the client-side `required` attributes.
            // profession/"Office" was dropped from the public register
            // form (still collected separately by admins via the console).
            'preferred_channel' =>  'required|in:email,phone,sms,whatsapp',
            'address'           =>  'required|string|max:255',
            'city_id'           =>  'required|integer|exists:cities,id',
            'state_id'          =>  'required|integer|exists:states,id',
            'country_id'        =>  'required|integer|exists:countries,id',
            'pincode'           =>  'required|string|max:10',
            'relation'          =>  'nullable|in:head,partner,child,father,mother,sibling,other',
        ];
    }

    public function messages()
    {
        return[
            'church_id.required'                =>  'Select Any One Church',

            'firstname.required'                =>  'First Name Is Required',
            'firstname.check_firstname'         =>  'Enter A Valid First Name',
            'firstname.max:15'                  =>  'First Name Should Be Atmost 15 Digits',

            'gender.required'                   =>  'Gender Is Required',

            'date_of_birth.required'            =>  'Date Of Birth Is Required',
            'date_of_birth.check_date_of_birth' =>  'Enter Valid Date Of Birth',

            'mobile_no.required'                =>  'Mobile Number Is Required',
            'mobile_no.numeric'                 =>  'Mobile Number Should Be Numeric',
            'mobile_no.digits:10'               =>  'Mobile Number Should Be 10 Digits',
            'mobile_no.check_unique_mobile'     =>  'Mobile Number Already In Use. Enter Different Mobile Number',

            'email.required'                    =>  'Email ID Is Required',
            'email.email'                       =>  'Enter A valid Email ID ',
            'email.check_unique_email'          =>  'Email ID Already In Use. Enter Different Email ID',

            'password.required'                 =>  'Password Is Required',
            'password.min'                      =>  'Password Must Be At Least 8 Characters',
            'password.confirmed'                =>  'Passwords Do Not Match',
        ];
    }
}