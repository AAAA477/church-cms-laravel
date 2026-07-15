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

    private const IMAGE_KEYS = ['church_logo', 'favicon', 'facebook_image', 'twitter_image', 'hero_image'];

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

        // Carousel slides store relative image paths; the form also needs a
        // displayable URL, so each slide gains an image_url alongside.
        if (! empty($details['about_carousel']) && $details['about_carousel'] !== '-') {
            $slides = json_decode($details['about_carousel'], true);
            if (is_array($slides)) {
                foreach ($slides as &$slide) {
                    $image = $slide['image'] ?? '';
                    $slide['image_url'] = $image === '' || str_starts_with($image, 'http')
                        ? $image
                        : $this->getFilePath($image);
                }
                $details['about_carousel'] = json_encode(array_values($slides));
            }
        }

        return response()->json($details);
    }

    public function update(Request $request)
    {
        $churchId = $request->user()->church_id;

        foreach ($request->except(self::IMAGE_KEYS) as $key => $value) {
            // Slide image files (about_carousel_image_{i}) are consumed by
            // saveAboutCarousel, and about_carousel itself is canonicalized
            // there — keep both out of the generic key-value loop.
            if (! is_string($key) || str_starts_with($key, 'about_carousel')) {
                continue;
            }

            ChurchDetail::updateOrCreate(
                ['church_id' => $churchId, 'meta_key' => $key],
                ['meta_value' => $value === null ? '-' : (string) $value]
            );
        }

        if ($request->has('about_carousel')) {
            $this->saveAboutCarousel($request, $churchId);
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

    /**
     * Homepage About carousel: the form sends an about_carousel JSON array
     * of {image, title, text, upload?} plus files named
     * about_carousel_image_{i}. A slide with "upload": i takes the uploaded
     * file i as its image; otherwise it keeps its stored relative path.
     */
    private function saveAboutCarousel(Request $request, int $churchId): void
    {
        $slides = json_decode((string) $request->input('about_carousel'), true);
        $slides = is_array($slides) ? $slides : [];

        $clean = [];
        foreach ($slides as $slide) {
            if (! is_array($slide)) {
                continue;
            }

            $image = $slide['image'] ?? '';
            if (isset($slide['upload']) && $request->hasFile('about_carousel_image_' . $slide['upload'])) {
                $image = $this->uploadFile(
                    "{$churchId}/settings",
                    $request->file('about_carousel_image_' . $slide['upload'])
                );
            }

            // Never persist full URLs — getFilePath re-expands relative
            // paths per-environment (the docker deploy relies on this).
            if (str_starts_with($image, 'http')) {
                $image = parse_url($image, PHP_URL_PATH) ?? '';
                $image = preg_replace('#^/storage/#', '', $image) ?? '';
            }

            $title = trim((string) ($slide['title'] ?? ''));
            $text  = trim((string) ($slide['text'] ?? ''));

            if ($image === '' && $title === '' && $text === '') {
                continue;
            }

            $clean[] = ['image' => $image, 'title' => $title, 'text' => $text];
        }

        ChurchDetail::updateOrCreate(
            ['church_id' => $churchId, 'meta_key' => 'about_carousel'],
            ['meta_value' => $clean === [] ? '-' : json_encode($clean)]
        );
    }
}
