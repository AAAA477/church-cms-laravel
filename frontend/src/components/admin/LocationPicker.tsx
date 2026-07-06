"use client";

import { useEffect, useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

type Option = { id: number; name: string };

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  return res.ok ? res.json() : [];
}

/**
 * Cascading country → state → city selects backed by the master-data
 * lookups. Uncontrolled from the form's perspective: renders real
 * <select name="…"> elements so the values ride along in FormData like
 * every other field. `initial*` ids prefill edit forms.
 */
export default function LocationPicker({
  initialCountryId,
  initialStateId,
  initialCityId,
}: {
  initialCountryId?: number | null;
  initialStateId?: number | null;
  initialCityId?: number | null;
}) {
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [countryId, setCountryId] = useState<string>(initialCountryId ? String(initialCountryId) : "");
  const [stateId, setStateId] = useState<string>(initialStateId ? String(initialStateId) : "");
  const [cityId, setCityId] = useState<string>(initialCityId ? String(initialCityId) : "");

  useEffect(() => {
    let cancelled = false;

    fetchOptions("/bff/admin/countries").then((data) => {
      if (!cancelled) setCountries(data);
    });
    if (initialCountryId) {
      fetchOptions(`/bff/admin/states?country_id=${initialCountryId}`).then((data) => {
        if (!cancelled) setStates(data);
      });
    }
    if (initialStateId) {
      fetchOptions(`/bff/admin/cities?state_id=${initialStateId}`).then((data) => {
        if (!cancelled) setCities(data);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [initialCountryId, initialStateId]);

  function handleCountryChange(value: string) {
    setCountryId(value);
    setStateId("");
    setCityId("");
    setStates([]);
    setCities([]);
    if (value) {
      fetchOptions(`/bff/admin/states?country_id=${value}`).then(setStates);
    }
  }

  function handleStateChange(value: string) {
    setStateId(value);
    setCityId("");
    setCities([]);
    if (value) {
      fetchOptions(`/bff/admin/cities?state_id=${value}`).then(setCities);
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <div>
        <label htmlFor="country_id" className={labelClasses}>
          Country
        </label>
        <select
          id="country_id"
          name="country_id"
          value={countryId}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">—</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="state_id" className={labelClasses}>
          State / Region
        </label>
        <select
          id="state_id"
          name="state_id"
          value={stateId}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={!countryId}
          className={inputClasses}
        >
          <option value="">—</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="city_id" className={labelClasses}>
          City
        </label>
        <select
          id="city_id"
          name="city_id"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          disabled={!stateId}
          className={inputClasses}
        >
          <option value="">—</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
