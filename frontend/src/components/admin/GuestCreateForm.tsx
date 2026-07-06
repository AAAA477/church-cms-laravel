"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LocationPicker from "@/components/admin/LocationPicker";
import { PROFESSION_OPTIONS } from "@/lib/member-options";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function GuestCreateForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create guest"));
        setStatus("error");
        return;
      }

      router.push(`/console/guests/${body.id}`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstname" className={labelClasses}>
            First Name
          </label>
          <input id="firstname" name="firstname" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="lastname" className={labelClasses}>
            Last Name
          </label>
          <input id="lastname" name="lastname" className={inputClasses} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className={labelClasses}>
            Gender
          </label>
          <select id="gender" name="gender" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select…
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="transgender">Transgender</option>
          </select>
        </div>
        <div>
          <label htmlFor="date_of_birth" className={labelClasses}>
            Date of Birth
          </label>
          <input id="date_of_birth" name="date_of_birth" type="date" required className={inputClasses} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="mobile_no" className={labelClasses}>
            Mobile Number
          </label>
          <input
            id="mobile_no"
            name="mobile_no"
            required
            pattern="\d{10}"
            title="10 digit mobile number"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input id="email" name="email" type="email" className={inputClasses} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profession" className={labelClasses}>
            Profession
          </label>
          <select id="profession" name="profession" defaultValue="" className={inputClasses}>
            <option value="">—</option>
            {PROFESSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sub_occupation" className={labelClasses}>
            Sub Occupation
          </label>
          <input id="sub_occupation" name="sub_occupation" className={inputClasses} />
        </div>
      </div>

      <LocationPicker />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className={labelClasses}>
            Address
          </label>
          <input id="address" name="address" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="pincode" className={labelClasses}>
            Postal Code
          </label>
          <input id="pincode" name="pincode" maxLength={10} className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClasses}>
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} className={inputClasses} />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Creating…" : "Create Guest"}
      </button>
    </form>
  );
}
