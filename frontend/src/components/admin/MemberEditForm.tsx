"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminMemberDetail } from "@/lib/api-types";
import LocationPicker from "@/components/admin/LocationPicker";
import { MARRIAGE_STATUS_OPTIONS, PROFESSION_OPTIONS } from "@/lib/member-options";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function MemberEditForm({ member }: { member: AdminMemberDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch(`/bff/admin/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not save changes"));
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstname" className={labelClasses}>
            First Name
          </label>
          <input
            id="firstname"
            name="firstname"
            defaultValue={member.firstname ?? ""}
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="lastname" className={labelClasses}>
            Last Name
          </label>
          <input
            id="lastname"
            name="lastname"
            defaultValue={member.lastname ?? ""}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className={labelClasses}>
            Gender
          </label>
          <select id="gender" name="gender" defaultValue={member.gender ?? ""} className={inputClasses}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="transgender">Transgender</option>
          </select>
        </div>
        <div>
          <label htmlFor="date_of_birth" className={labelClasses}>
            Date of Birth
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            defaultValue={member.date_of_birth ?? ""}
            className={inputClasses}
          />
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
            defaultValue={member.mobile_no}
            pattern="\d{10}"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={member.email ?? ""}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profession" className={labelClasses}>
            Profession
          </label>
          <select
            id="profession"
            name="profession"
            defaultValue={member.profession ?? ""}
            className={inputClasses}
          >
            <option value="">—</option>
            {PROFESSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="marriage_status" className={labelClasses}>
            Marital Status
          </label>
          <select
            id="marriage_status"
            name="marriage_status"
            defaultValue={member.marriage_status ?? ""}
            className={inputClasses}
          >
            <option value="">—</option>
            {MARRIAGE_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="family" className={labelClasses}>
          Family
        </label>
        <input id="family" name="family" defaultValue={member.family ?? ""} className={inputClasses} />
      </div>

      <LocationPicker
        initialCountryId={member.country_id}
        initialStateId={member.state_id}
        initialCityId={member.city_id}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className={labelClasses}>
            Address
          </label>
          <input id="address" name="address" defaultValue={member.address ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="pincode" className={labelClasses}>
            Postal Code
          </label>
          <input id="pincode" name="pincode" defaultValue={member.pincode ?? ""} maxLength={10} className={inputClasses} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-700" role="status">
          Changes saved.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
