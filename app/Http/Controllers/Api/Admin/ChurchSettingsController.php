<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChurchDetail;
use App\Traits\Common;
use App\Traits\LogActivity;
use Illuminate\Http\Request;

/**
 * Church settings for the Next.js admin console (/console/settings).
 *
 * The legacy admin spreads this over ~8 controllers (Setting\{General,
 * Maintenance,SeoDetail,ChurchSettings}, ChurchDetailsController) that all,
 * underneath, read/write the same `church_details` EAV table
 * (church_id, meta_key, meta_value) — MaintenanceController's "settings"
 * table calls are a red herring; SettingProcess::updatesettings() writes to
 * ChurchDetail too. Rather than rebuild 8 near-identical thin wrappers,
 * this is one generic key-value endpoint; the frontend organizes the same
 * underlying data into sections (General/Contact/Social/SEO/Maintenance)
 * purely for UX, matching how the legacy pages were organized.
 */
class ChurchSettingsController extends Controller
{
    use Common, LogActivity;

    private const IMAGE_KEYS = ['church_logo', 'favicon', 'facebook_image', 'twitter_image'];

    public function index(Request $request)
    {
        $churchId = $request->user()->church_id;

        $details = ChurchDetail::where('church_id', $churchId)
            ->pluck('meta_value', 'meta_key')
            ->map(fn ($v) => $v === '-' ? null : $v)
            ->toArray();

        foreach (self::IMAGE_KEYS as $key) {
            if (! empty($details[$key]) && ! str_starts_with($details[$key], 'http')) {
                $details[$key] = $this->getFilePath($details[$key]);
            }
        }

        return response()->json($details);
    }

    public function update(Request $request)
    {
        $churchId = $request->user()->church_id;

        foreach ($request->except(self::IMAGE_KEYS) as $key => $value) {
            if (is_string($key)) {
                ChurchDetail::updateOrCreate(
                    ['church_id' => $churchId, 'meta_key' => $key],
                    ['meta_value' => $value === null ? '-' : (string) $value]
                );
            }
        }

        foreach (self::IMAGE_KEYS as $key) {
            if ($request->hasFile($key)) {
                $path = $this->uploadFile("{$churchId}/settings", $request->file($key));
                ChurchDetail::updateOrCreate(
                    ['church_id' => $churchId, 'meta_key' => $key],
                    ['meta_value' => $path]
                );
            }
        }

        $this->doActivityLog(
            $request->user(),
            $request->user(),
            ['ip' => $this->getRequestIP(), 'details' => $request->userAgent()],
            LOGNAME_EDIT_CHURCH_DETAIL,
            'Church Settings Updated Successfully'
        );

        return response()->json(['success' => true]);
    }
}
