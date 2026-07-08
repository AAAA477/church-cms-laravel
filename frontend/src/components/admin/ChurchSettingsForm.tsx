"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminChurchSettings } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6 mb-6 border-b border-warm-deep last:border-b-0 last:mb-0 last:pb-0">
      <h3 className="font-display text-xl text-ink mb-4">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function ChurchSettingsForm({ settings }: { settings: AdminChurchSettings }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
    ]) {
      if (!formData.has(key)) formData.set(key, "0");
    }

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
      <Section title="General">
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

      <Section title="Contact">
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

      <Section title="About">
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
      </Section>

      <Section title="Social Media">
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
      </Section>

      <Section title="SEO">
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

      <Section title="HTML / JS Code">
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

      <Section title="Open Graph Tags">
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

      <Section title="Maintenance & Access">
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
