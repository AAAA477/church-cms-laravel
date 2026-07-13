<?php

namespace App\Observers;

use App\Traits\MustVerifyEmail;
use App\Models\User;
use Exception;
use Log;

class UserObserver
{
    use MustVerifyEmail;

    /**
     * Handle the user "created" event.
     *
     * @param  \App\User  $user
     * @return void
     */
    public function created(User $user)
    {
        //
        try
        {
            // With the log driver there is no real mailbox to verify —
            // and rendering the mail synchronously has been observed to
            // blow the 30s execution limit on some environments, which is
            // a FATAL the catch below can never see (it rolls back the
            // whole registration). Skip until a real mailer is configured.
            if (config('mail.driver') === 'log') {
                return;
            }

            if($user->email != null)
            {
                if(is_null($user->email_verified_at))
                {
                    $this->sendEmailVerificationNotification($user);
                }
            }
        }
        catch(Exception $e)
        {
            Log::info($e->getMessage());
            //dd($e->getMessage());
        }
    }

    /**
     * Handle the user "updated" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        //
    }

    /**
     * Handle the user "deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function deleted(User $user)
    {
        //
    }

    /**
     * Handle the user "restored" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function restored(User $user)
    {
        //
    }

    /**
     * Handle the user "force deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function forceDeleted(User $user)
    {
        //
    }
}