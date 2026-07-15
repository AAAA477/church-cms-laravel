"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminChurchSettings } from "@/lib/api-types";
import {
  buildCustomPalette,
  contrastRatio,
  CUSTOM_PALETTE_KEY,
  DEFAULT_PALETTE_KEY,
  isValidCustomColors,
  PALETTES,
  type CustomColors,
} from "@/lib/palettes";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

// Key areas mirroring the legacy admin's settings sidebar (General,
// Maintenance, SEO, HTML Code, Open Graph Tags, Social Media, Contact,
// Location) plus About (legacy Church Details) and the new Privacy area.
// A homepage About-carousel slide as edited in the form. `image` is the
// stored relative path, `image_url` a displayable URL (added by the API),
// `file` a newly chosen replacement not yet uploaded.
type SlideDraft = {
  image: string;
  image_url: string;
  title: string;
  text: string;
  file?: File;
  preview?: string;
};

const AREAS = [
  "General",
  "Contact",
  "Location",
  "About",
  "Appearance",
  "Social Media",
  "SEO",
  "HTML Code",
  "Open Graph Tags",
  "Maintenance",
  "Privacy",
] as const;

// Inactive areas stay mounted but hidden so every field is still
// submitted with the single Save button.
function Section({ title, hidden, children }: { title: string; hidden?: boolean; children: React.ReactNode }) {
  return (
    <div className={hidden ? "hidden" : "pb-6"}>
      <h3 className="font-display text-xl text-ink mb-4">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function ChurchSettingsForm({ settings }: { settings: AdminChurchSettings }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [area, setArea] = useState<(typeof AREAS)[number]>("General");

  // Extra social links beyond the four fixed platforms, stored as one
  // JSON setting (extra_social_links). Inputs are unnamed so FormData
  // skips them; the serialized JSON is appended on submit instead.
  const [extraLinks, setExtraLinks] = useState<{ label: string; url: string }[]>(() => {
    try {
      const parsed = JSON.parse(settings.extra_social_links ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Website theme palette (Appearance tab), submitted via a hidden input.
  const [palette, setPalette] = useState(settings.theme_palette || DEFAULT_PALETTE_KEY);

  // Custom palette colors; defaults seed from the Warm Earth preset.
  const [customColors, setCustomColors] = useState<CustomColors>(() => {
    try {
      const parsed = JSON.parse(settings.theme_custom_colors ?? "null");
      if (isValidCustomColors(parsed)) return parsed;
    } catch {
      // fall through to defaults
    }
    const d = PALETTES[0].colors;
    return { primary: d.primary, accent: d.accent, background: d.cream, text: d.ink };
  });

  // Homepage hero background image + blur radius, with a live preview that
  // updates as the admin picks a file or drags the slider, before saving.
  const [heroBlur, setHeroBlur] = useState(() => {
    const n = Number(settings.hero_blur);
    return Number.isFinite(n) ? n : 8;
  });
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(settings.hero_image || null);

  // Homepage About carousel slides. Same unnamed-inputs pattern as
  // extraLinks: serialized to the about_carousel JSON on submit, with newly
  // chosen images appended as about_carousel_image_{i} files.
  const [slides, setSlides] = useState<SlideDraft[]>(() => {
    try {
      const parsed = JSON.parse(settings.about_carousel ?? "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map((s) => ({
        image: typeof s?.image === "string" ? s.image : "",
        image_url: typeof s?.image_url === "string" ? s.image_url : "",
        title: typeof s?.title === "string" ? s.title : "",
        text: typeof s?.text === "string" ? s.text : "",
      }));
    } catch {
      return [];
    }
  });

  function updateSlide(i: number, patch: Partial<SlideDraft>) {
    setSlides((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }

  function moveSlide(i: number, dir: -1 | 1) {
    setSlides((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Checkbox flags need explicit "0"/"1" since unchecked boxes are
    // omitted from FormData entirely.
    for (const key of [
      "maintenance",
      "register_status",
      "login_status",
      "guest_login",
      "guest_registration",
      "member_web_login",
      "hide_birth_year",
    ]) {
      if (!formData.has(key)) formData.set(key, "0");
    }

    formData.set(
      "extra_social_links",
      JSON.stringify(extraLinks.filter((l) => l.label.trim() && l.url.trim())),
    );

    // Carousel: slides with a freshly chosen image reference their file by
    // index ("upload"); the backend swaps in the uploaded path.
    let uploadIndex = 0;
    const slidePayload = slides.map((s) => {
      const entry: { image: string; title: string; text: string; upload?: number } = {
        image: s.image,
        title: s.title,
        text: s.text,
      };
      if (s.file) {
        entry.upload = uploadIndex;
        formData.set(`about_carousel_image_${uploadIndex}`, s.file);
        uploadIndex += 1;
      }
      return entry;
    });
    formData.set("about_carousel", JSON.stringify(slidePayload));
    formData.set("theme_custom_colors", JSON.stringify(customColors));

    try {
      const res = await fetch("/bff/admin/church-settings", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Could not save settings");
        setStatus("error");
        return;
      }
      setStatus("success");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="flex flex-wrap gap-1 mb-8 border-b border-warm-deep pb-3" role="tablist">
        {AREAS.map((a) => (
          <button
            key={a}
            type="button"
            role="tab"
            aria-selected={area === a ? "true" : "false"}
            onClick={() => setArea(a)}
            className={
              area === a
                ? "px-3 py-1.5 text-sm font-medium rounded-sm bg-primary text-white"
                : "px-3 py-1.5 text-sm font-medium rounded-sm text-ink-soft hover:bg-warm hover:text-primary transition-colors"
            }
          >
            {a}
          </button>
        ))}
      </div>

      <Section title="General" hidden={area !== "General"}>
        <div>
          <label htmlFor="church_full_name" className={labelClasses}>
            Church Full Name
          </label>
          <input
            id="church_full_name"
            name="church_full_name"
            defaultValue={settings.church_full_name ?? ""}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="church_short_name" className={labelClasses}>
            Church Short Name
          </label>
          <input
            id="church_short_name"
            name="church_short_name"
            defaultValue={settings.church_short_name ?? ""}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="church_logo" className={labelClasses}>
            Church Logo
          </label>
          <input id="church_logo" name="church_logo" type="file" accept="image/*" className={inputClasses} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="favicon" className={labelClasses}>
            Favicon
          </label>
          <input id="favicon" name="favicon" type="file" accept="image/*" className={inputClasses} />
        </div>
      </Section>

      <Section title="Contact" hidden={area !== "Contact"}>
        <div>
          <label htmlFor="phone" className={labelClasses}>
            Phone
          </label>
          <input id="phone" name="phone" defaultValue={settings.phone ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input id="email" name="email" type="email" defaultValue={settings.email ?? ""} className={inputClasses} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className={labelClasses}>
            Address
          </label>
          <input id="address" name="address" defaultValue={settings.address ?? ""} className={inputClasses} />
        </div>
      </Section>

      <Section title="Location" hidden={area !== "Location"}>
        <div>
          <label htmlFor="latitude" className={labelClasses}>
            Latitude
          </label>
          <input id="latitude" name="latitude" defaultValue={settings.latitude ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="longitude" className={labelClasses}>
            Longitude
          </label>
          <input id="longitude" name="longitude" defaultValue={settings.longitude ?? ""} className={inputClasses} />
        </div>
      </Section>

      <Section title="About" hidden={area !== "About"}>
        <div className="sm:col-span-2">
          <label htmlFor="short_summary" className={labelClasses}>
            Short Summary
          </label>
          <input
            id="short_summary"
            name="short_summary"
            defaultValue={settings.short_summary ?? ""}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="long_summary" className={labelClasses}>
            Long Summary
          </label>
          <textarea
            id="long_summary"
            name="long_summary"
            rows={3}
            defaultValue={settings.long_summary ?? ""}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="quotes" className={labelClasses}>
            Quote / Motto
          </label>
          <input id="quotes" name="quotes" defaultValue={settings.quotes ?? ""} className={inputClasses} />
        </div>

        <div className="sm:col-span-2 pt-2">
          <p className={labelClasses}>Homepage Carousel Slides</p>
          <p className="text-xs text-ink-soft mb-3">
            Shown as the About Us carousel on the homepage. Each slide has an image, a heading and a short text.
          </p>
          <div className="space-y-4">
            {slides.map((slide, i) => (
              <div key={i} className="rounded-sm border border-warm-deep p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-none w-36">
                    {slide.preview || slide.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.preview || slide.image_url}
                        alt={slide.title || `Slide ${i + 1}`}
                        className="w-36 h-24 object-cover rounded-sm border border-warm-deep"
                      />
                    ) : (
                      <div className="w-36 h-24 rounded-sm border border-dashed border-warm-deep flex items-center justify-center text-xs text-ink-soft">
                        No image
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      aria-label={`Slide ${i + 1} image`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateSlide(i, { file, preview: URL.createObjectURL(file) });
                        }
                      }}
                      className="mt-2 w-36 text-xs text-ink-soft"
                    />
                  </div>
                  <div className="flex-1 min-w-56 space-y-2">
                    <input
                      placeholder="Slide heading"
                      value={slide.title}
                      onChange={(e) => updateSlide(i, { title: e.target.value })}
                      className={inputClasses}
                    />
                    <textarea
                      placeholder="Slide text"
                      rows={3}
                      value={slide.text}
                      onChange={(e) => updateSlide(i, { text: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveSlide(i, -1)}
                    className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-warm-deep text-ink-soft hover:bg-warm disabled:opacity-40"
                  >
                    ↑ Up
                  </button>
                  <button
                    type="button"
                    disabled={i === slides.length - 1}
                    onClick={() => moveSlide(i, 1)}
                    className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-warm-deep text-ink-soft hover:bg-warm disabled:opacity-40"
                  >
                    ↓ Down
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlides((prev) => prev.filter((_, j) => j !== i))}
                    className="ml-auto text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-red-600 text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSlides((prev) => [...prev, { image: "", image_url: "", title: "", text: "" }])}
            className="mt-3 text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-primary text-primary hover:bg-warm"
          >
            + Add Slide
          </button>
        </div>
      </Section>

      <Section title="Appearance" hidden={area !== "Appearance"}>
        <div className="sm:col-span-2">
          <p className={labelClasses}>Website Theme Colors</p>
          <p className="text-xs text-ink-soft mb-3">
            Applies to the public website, member portal and this console.
          </p>
          <input type="hidden" name="theme_palette" value={palette} />
          <div className="grid gap-3 sm:grid-cols-2">
            {PALETTES.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={palette === p.key ? "true" : "false"}
                onClick={() => setPalette(p.key)}
                className={
                  "flex items-center gap-3 rounded-sm border p-3 text-left transition-colors " +
                  (palette === p.key
                    ? "border-primary ring-1 ring-primary bg-warm"
                    : "border-warm-deep hover:border-primary/50")
                }
              >
                <span className="flex -space-x-1.5 flex-none">
                  {[p.colors.primary, p.colors.accent, p.colors.warmDeep, p.colors.cream, p.colors.ink].map(
                    (c) => (
                      <span
                        key={c}
                        className="w-6 h-6 rounded-full border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ),
                  )}
                </span>
                <span className="text-sm font-medium text-ink">{p.name}</span>
              </button>
            ))}

            <button
              type="button"
              aria-pressed={palette === CUSTOM_PALETTE_KEY ? "true" : "false"}
              onClick={() => setPalette(CUSTOM_PALETTE_KEY)}
              className={
                "flex items-center gap-3 rounded-sm border p-3 text-left transition-colors " +
                (palette === CUSTOM_PALETTE_KEY
                  ? "border-primary ring-1 ring-primary bg-warm"
                  : "border-warm-deep hover:border-primary/50")
              }
            >
              <span
                className="w-6 h-6 rounded-full border border-black/10 flex-none"
                style={{
                  background:
                    "conic-gradient(#e74c3c, #f39c12, #2ecc71, #3498db, #9b59b6, #e74c3c)",
                }}
              />
              <span className="text-sm font-medium text-ink">Custom…</span>
            </button>
          </div>

          {palette === CUSTOM_PALETTE_KEY && (
            <div className="mt-4 rounded-sm border border-warm-deep p-4">
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {(
                  [
                    ["primary", "Primary"],
                    ["accent", "Accent"],
                    ["background", "Background"],
                    ["text", "Text"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label htmlFor={`custom_${key}`} className={labelClasses}>
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={`custom_${key}`}
                        type="color"
                        value={customColors[key]}
                        onChange={(e) => setCustomColors((c) => ({ ...c, [key]: e.target.value }))}
                        className="h-9 w-12 cursor-pointer rounded-sm border border-warm-deep bg-white p-0.5"
                      />
                      <span className="text-xs text-ink-soft font-mono">{customColors[key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Derived shades preview — same relationships as the presets */}
              <div className="mt-4">
                <p className={labelClasses}>Preview</p>
                <div className="flex -space-x-1.5">
                  {Object.values(buildCustomPalette(customColors)).map((c, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {contrastRatio(customColors.primary, "#ffffff") < 4.5 && (
                <p className="mt-3 text-xs text-red-700">
                  ⚠ The primary color is light — white button text may be hard to read. Pick a darker shade.
                </p>
              )}
              {contrastRatio(customColors.text, customColors.background) < 4.5 && (
                <p className="mt-3 text-xs text-red-700">
                  ⚠ Low contrast between text and background colors — the site may be hard to read.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="sm:col-span-2 pt-6 border-t border-warm-deep">
          <p className={labelClasses}>Homepage Background Image</p>
          <p className="text-xs text-ink-soft mb-3">
            Shown behind the "Welcome to {"{Church Name}"}" hero text, blurred so the text stays readable.
          </p>

          <input
            id="hero_image"
            name="hero_image"
            type="file"
            accept="image/*"
            className={inputClasses}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setHeroImagePreview(URL.createObjectURL(file));
            }}
          />

          <div className="mt-4">
            <label htmlFor="hero_blur" className={labelClasses}>
              Blur amount — {heroBlur}px
            </label>
            <input
              id="hero_blur"
              name="hero_blur"
              type="range"
              min={0}
              max={40}
              value={heroBlur}
              onChange={(e) => setHeroBlur(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
          </div>

          <div className="mt-4">
            <p className={labelClasses}>Preview</p>
            {heroImagePreview ? (
              <div className="relative h-40 rounded-sm overflow-hidden border border-warm-deep">
                <div
                  className="absolute overflow-hidden"
                  style={{ inset: `-${Math.round(heroBlur * 1.5) + 12}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary blur radius, no need for next/image here */}
                  <img
                    src={heroImagePreview}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: `blur(${heroBlur}px)` }}
                  />
                  <div className="absolute inset-0 bg-cream/60" />
                </div>
                <div className="relative h-full flex items-center justify-center">
                  <p className="font-display text-2xl text-ink">{"Welcome to Your Church"}</p>
                </div>
              </div>
            ) : (
              <div className="h-40 rounded-sm border border-dashed border-warm-deep flex items-center justify-center text-xs text-ink-soft">
                No background image set
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Social Media" hidden={area !== "Social Media"}>
        <div>
          <label htmlFor="website" className={labelClasses}>
            Website
          </label>
          <input id="website" name="website" defaultValue={settings.website ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="facebook" className={labelClasses}>
            Facebook
          </label>
          <input id="facebook" name="facebook" defaultValue={settings.facebook ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="twitter" className={labelClasses}>
            Twitter
          </label>
          <input id="twitter" name="twitter" defaultValue={settings.twitter ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="instagram" className={labelClasses}>
            Instagram
          </label>
          <input id="instagram" name="instagram" defaultValue={settings.instagram ?? ""} className={inputClasses} />
        </div>

        <div className="sm:col-span-2 pt-2">
          <p className={labelClasses}>More Links (YouTube, TikTok, WhatsApp, …)</p>
          <div className="space-y-3">
            {extraLinks.map((link, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center">
                <input
                  placeholder="Platform (e.g. YouTube)"
                  value={link.label}
                  onChange={(e) =>
                    setExtraLinks((prev) => prev.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))
                  }
                  className={`${inputClasses} basis-48 flex-none`}
                />
                <input
                  placeholder="https://…"
                  value={link.url}
                  onChange={(e) =>
                    setExtraLinks((prev) => prev.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))
                  }
                  className={`${inputClasses} flex-1 min-w-56`}
                />
                <button
                  type="button"
                  aria-label={`Remove ${link.label || "link"}`}
                  onClick={() => setExtraLinks((prev) => prev.filter((_, j) => j !== i))}
                  className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-red-600 text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExtraLinks((prev) => [...prev, { label: "", url: "" }])}
            className="mt-3 text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-primary text-primary hover:bg-warm"
          >
            + Add Link
          </button>
        </div>
      </Section>

      <Section title="SEO" hidden={area !== "SEO"}>
        <div>
          <label htmlFor="site_title" className={labelClasses}>
            Site Title
          </label>
          <input id="site_title" name="site_title" defaultValue={settings.site_title ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="site_keyword" className={labelClasses}>
            Site Keywords
          </label>
          <input id="site_keyword" name="site_keyword" defaultValue={settings.site_keyword ?? ""} className={inputClasses} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="site_description" className={labelClasses}>
            Site Description
          </label>
          <textarea
            id="site_description"
            name="site_description"
            rows={2}
            defaultValue={settings.site_description ?? ""}
            className={inputClasses}
          />
        </div>
      </Section>

      <Section title="HTML Code" hidden={area !== "HTML Code"}>
        <div className="sm:col-span-2">
          <label htmlFor="header_code" className={labelClasses}>
            Header Code (inserted before &lt;/head&gt;)
          </label>
          <textarea
            id="header_code"
            name="header_code"
            rows={3}
            defaultValue={settings.header_code ?? ""}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="footer_code" className={labelClasses}>
            Footer Code (inserted before &lt;/body&gt;)
          </label>
          <textarea
            id="footer_code"
            name="footer_code"
            rows={3}
            defaultValue={settings.footer_code ?? ""}
            className={inputClasses}
          />
        </div>
      </Section>

      <Section title="Open Graph Tags" hidden={area !== "Open Graph Tags"}>
        <div>
          <label htmlFor="facebook_title" className={labelClasses}>
            Facebook Title
          </label>
          <input id="facebook_title" name="facebook_title" defaultValue={settings.facebook_title ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="facebook_url" className={labelClasses}>
            Facebook URL
          </label>
          <input id="facebook_url" name="facebook_url" defaultValue={settings.facebook_url ?? ""} className={inputClasses} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="facebook_description" className={labelClasses}>
            Facebook Description
          </label>
          <textarea
            id="facebook_description"
            name="facebook_description"
            rows={2}
            defaultValue={settings.facebook_description ?? ""}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="facebook_image" className={labelClasses}>
            Facebook Image
          </label>
          <input id="facebook_image" name="facebook_image" type="file" accept="image/*" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="twitter_title" className={labelClasses}>
            Twitter Title
          </label>
          <input id="twitter_title" name="twitter_title" defaultValue={settings.twitter_title ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="twitter_url" className={labelClasses}>
            Twitter URL
          </label>
          <input id="twitter_url" name="twitter_url" defaultValue={settings.twitter_url ?? ""} className={inputClasses} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="twitter_description" className={labelClasses}>
            Twitter Description
          </label>
          <textarea
            id="twitter_description"
            name="twitter_description"
            rows={2}
            defaultValue={settings.twitter_description ?? ""}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="twitter_image" className={labelClasses}>
            Twitter Image
          </label>
          <input id="twitter_image" name="twitter_image" type="file" accept="image/*" className={inputClasses} />
        </div>
      </Section>

      <Section title="Maintenance" hidden={area !== "Maintenance"}>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" name="maintenance" value="1" defaultChecked={settings.maintenance === "1"} />
          Maintenance Mode
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" name="register_status" value="1" defaultChecked={settings.register_status === "1"} />
          Allow Registration
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" name="login_status" value="1" defaultChecked={settings.login_status === "1"} />
          Allow Login
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" name="guest_login" value="1" defaultChecked={settings.guest_login === "1"} />
          Guest Login
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" name="guest_registration" value="1" defaultChecked={settings.guest_registration === "1"} />
          Guest Registration
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" name="member_web_login" value="1" defaultChecked={settings.member_web_login === "1"} />
          Member Web Login
        </label>
      </Section>

      <Section title="Privacy" hidden={area !== "Privacy"}>
        <label className="flex items-start gap-2 text-sm text-ink cursor-pointer sm:col-span-2">
          <input
            type="checkbox"
            name="hide_birth_year"
            value="1"
            defaultChecked={settings.hide_birth_year === "1"}
            className="mt-0.5"
          />
          <span>
            Hide year of birth
            <span className="block text-xs text-ink-soft">
              Member-facing profiles show only the day and month of birth. Admins still see full dates in the console.
            </span>
          </span>
        </label>
      </Section>

      {error && (
        <p className="text-sm text-red-700 mt-6" role="alert">
          {error}
        </p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-700 mt-6" role="status">
          Settings saved.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
