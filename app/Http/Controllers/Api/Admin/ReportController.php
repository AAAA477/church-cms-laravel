<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;
use League\Csv\Writer;

/**
 * CSV member/guest exports for the Next.js admin console
 * (/console/reports). Mirrors app/Http/Controllers/Admin/ReportsController's
 * five near-identical export* methods, consolidated into one endpoint
 * (type + status query params) — the legacy versions also have real bugs
 * that would crash on this rebuild's data (e.g. `$userprofile->city->name`
 * on a null `city` relation, which is common now that city/state/country
 * were relaxed to optional back in Phase 6, and exportBirthday references
 * an undefined `$userprofile` variable). This version null-safes every
 * relation instead of reproducing those crashes.
 */
class ReportController extends Controller
{
    use Common, LogActivity;

    public function exportMembers(Request $request)
    {
        $churchId = $request->user()->church_id;
        $membershipType = $request->query('type', 'member');
        $status = $request->query('status');

        $query = User::with('userprofile.city', 'userprofile.state', 'userprofile.country')
            ->where('church_id', $churchId)
            ->where('usergroup_id', 5)
            ->whereHas('userprofile', function ($q) use ($membershipType, $status) {
                $q->where('membership_type', $membershipType);
                if ($status) {
                    $q->where('status', $status);
                }
            });

        $users = $query->get();

        $csv = Writer::createFromFileObject(new \SplTempFileObject());
        $csv->insertOne([
            'name', 'firstname', 'lastname', 'gender', 'date_of_birth', 'profession',
            'address', 'city', 'state', 'country', 'pincode', 'mobile_no', 'email',
            'membership_type', 'marriage_status', 'status',
        ]);

        foreach ($users as $user) {
            $p = $user->userprofile;
            $csv->insertOne([
                $user->name,
                optional($p)->firstname,
                optional($p)->lastname,
                optional($p)->gender,
                optional($p)->date_of_birth,
                optional($p)->profession,
                optional($p)->address,
                optional(optional($p)->city)->name,
                optional(optional($p)->state)->name,
                optional(optional($p)->country)->name,
                optional($p)->pincode,
                $user->mobile_no,
                $user->email,
                optional($p)->membership_type,
                optional($p)->marriage_status,
                optional($p)->status,
            ]);
        }

        $this->doActivityLog(
            $request->user(),
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EXPORT_ACTIVE_MEMBERS,
            ucfirst($membershipType) . ' Export'
        );

        $filename = "{$membershipType}-export-" . date('Y-m-d_His') . '.csv';

        return response($csv->toString(), 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
