"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PROFESSION_OPTIONS } from "@/lib/member-options";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Sentinel year stored when the registrant gives only day + month (1924 is
// a leap year, so Feb 29 stays valid, and it passes the API's >= 1920
// birth-date check). The member-facing API already hides birth years.
const NO_YEAR = 1924;

type GeoOption = { id: number; name: string };

type HouseholdMember = {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  relation: string;
  mobile_no: string;
};

const emptyMember: HouseholdMember = {
  firstname: "",
  lastname: "",
  gender: "",
  date_of_birth: "",
  relation: "",
  mobile_no: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // Household members registered along with the account holder. Controlled
  // inputs without name attributes, so FormData below skips them.
  const [household, setHousehold] = useState<HouseholdMember[]>([]);

  // Cascading address selects (controlled; ids submitted explicitly).
  const [countries, setCountries] = useState<GeoOption[]>([]);
  const [states, setStates] = useState<GeoOption[]>([]);
  const [cities, setCities] = useState<GeoOption[]>([]);
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");

  useEffect(() => {
    fetch("/bff/public/geo/countries")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    setStates([]);
    setStateId("");
    if (!countryId) return;
    fetch(`/bff/public/geo/states/${countryId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setStates)
      .catch(() => setStates([]));
  }, [countryId]);

  useEffect(() => {
    setCities([]);
    setCityId("");
    if (!stateId) return;
    fetch(`/bff/public/geo/cities/${stateId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCities)
      .catch(() => setCities([]));
  }, [stateId]);

  function setMember(i: number, patch: Partial<HouseholdMember>) {
    setHousehold((prev) => prev.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data: Record<string, FormDataEntryValue | undefined> = Object.fromEntries(
      new FormData(form),
    );

    // Compose date_of_birth from the day/month(/optional year) selects.
    const day = String(data.birth_day ?? "");
    const month = String(data.birth_month ?? "");
    const year = String(data.birth_year ?? "") || String(NO_YEAR);
    delete data.birth_day;
    delete data.birth_month;
    delete data.birth_year;

    try {
      const registerRes = await fetch("/bff/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date_of_birth: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
          country_id: countryId || undefined,
          state_id: stateId || undefined,
          city_id: cityId || undefined,
          household: household
            .filter((m) => m.firstname.trim())
            .map((m) => ({
              ...m,
              lastname: m.lastname.trim() || undefined,
              mobile_no: m.mobile_no.trim() || undefined,
            })),
        }),
      });

      if (!registerRes.ok) {
        const body = await registerRes.json().catch(() => ({}));
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(
          typeof first === "string" ? first : (body.message ?? "Registration failed"),
        );
        setStatus("error");
        return;
      }

      const loginRes = await fetch("/bff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!loginRes.ok) {
        // Registered fine but auto-login failed — send them to sign in manually.
        router.push("/member/login");
        return;
      }

      router.push("/member");
      router.refresh();
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-ink mb-2">
            First Name
          </label>
          <input
            id="firstname"
            name="firstname"
            required
            maxLength={15}
            pattern="[A-Za-z\s]+"
            placeholder="Jane"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="lastname" className="block text-sm font-medium text-ink mb-2">
            Last Name
          </label>
          <input
            id="lastname"
            name="lastname"
            maxLength={15}
            pattern="[A-Za-z\s]+"
            placeholder="Doe"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-ink mb-2">
            Gender
          </label>
          <select id="gender" name="gender" required className={inputClasses}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <span className="block text-sm font-medium text-ink mb-2">Birthday</span>
          <div className="grid grid-cols-3 gap-2">
            <select name="birth_day" required aria-label="Birth day" className={inputClasses}>
              <option value="">Day…</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select name="birth_month" required aria-label="Birth month" className={inputClasses}>
              <option value="">Month…</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select name="birth_year" aria-label="Birth year (optional)" className={inputClasses}>
              <option value="">Year…</option>
              {Array.from(
                { length: new Date().getFullYear() - 1925 },
                (_, i) => new Date().getFullYear() - i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-ink-soft">Year is optional.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="mobile_no" className="block text-sm font-medium text-ink mb-2">
            Phone
          </label>
          <input
            id="mobile_no"
            name="mobile_no"
            type="tel"
            required
            pattern="\d{10}"
            title="10-digit phone number"
            placeholder="0501234567"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-ink mb-2">
            Office / Profession
          </label>
          <select id="profession" name="profession" className={inputClasses}>
            <option value="">Select…</option>
            {PROFESSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="preferred_channel" className="block text-sm font-medium text-ink mb-2">
            Preferred Contact Method
          </label>
          <select id="preferred_channel" name="preferred_channel" className={inputClasses}>
            <option value="">Select…</option>
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="sms">Text Message (SMS)</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-ink mb-2">
            Street Address
          </label>
          <input
            id="address"
            name="address"
            maxLength={255}
            placeholder="123 Main St"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="pincode" className="block text-sm font-medium text-ink mb-2">
            Postal Code
          </label>
          <input
            id="pincode"
            name="pincode"
            maxLength={10}
            placeholder="A1A 1A1"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-ink mb-2">
            Country
          </label>
          <select
            id="country"
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className={inputClasses}
          >
            <option value="">Select…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-ink mb-2">
            Province / State
          </label>
          <select
            id="province"
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            disabled={!countryId}
            className={inputClasses}
          >
            <option value="">{countryId ? "Select…" : "Pick a country first"}</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-ink mb-2">
            City
          </label>
          <select
            id="city"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            disabled={!stateId}
            className={inputClasses}
          >
            <option value="">{stateId ? "Select…" : "Pick a province first"}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="relation" className="block text-sm font-medium text-ink mb-2">
          Household Role
        </label>
        <select id="relation" name="relation" defaultValue="head" className={inputClasses}>
          <option value="head">Head of Household</option>
          <option value="partner">Spouse / Partner</option>
          <option value="child">Child</option>
          <option value="father">Father</option>
          <option value="mother">Mother</option>
          <option value="sibling">Sibling</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-medium text-ink mb-2"
          >
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-warm-deep">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-ink">Your Household</p>
          <button
            type="button"
            onClick={() => setHousehold((prev) => [...prev, { ...emptyMember }])}
            className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-primary text-primary hover:bg-warm"
          >
            + Add Member
          </button>
        </div>
        <p className="text-xs text-ink-soft mb-3">
          Optionally register your spouse, children, or other household members with you. They
          won&apos;t get their own login.
        </p>

        <div className="space-y-4">
          {household.map((m, i) => (
            <div key={i} className="rounded-sm border border-warm-deep p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="First name *"
                  required
                  value={m.firstname}
                  onChange={(e) => setMember(i, { firstname: e.target.value })}
                  className={inputClasses}
                />
                <input
                  placeholder="Last name (yours if blank)"
                  value={m.lastname}
                  onChange={(e) => setMember(i, { lastname: e.target.value })}
                  className={inputClasses}
                />
                <select
                  required
                  title="Relationship"
                  value={m.relation}
                  onChange={(e) => setMember(i, { relation: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">Relationship…</option>
                  <option value="partner">Spouse / Partner</option>
                  <option value="child">Child</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
                <select
                  required
                  title="Gender"
                  value={m.gender}
                  onChange={(e) => setMember(i, { gender: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">Gender…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <input
                  type="date"
                  required
                  title="Date of birth"
                  max={new Date().toISOString().split("T")[0]}
                  value={m.date_of_birth}
                  onChange={(e) => setMember(i, { date_of_birth: e.target.value })}
                  className={inputClasses}
                />
                <input
                  type="tel"
                  pattern="\d{10}"
                  title="10-digit phone number"
                  placeholder="Mobile (optional)"
                  value={m.mobile_no}
                  onChange={(e) => setMember(i, { mobile_no: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <button
                type="button"
                onClick={() => setHousehold((prev) => prev.filter((_, j) => j !== i))}
                className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-red-600 text-red-700 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm transition-all duration-300 rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
