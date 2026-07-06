"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QuickEditField } from "@/components/admin/QuickEditForm";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

/**
 * Always-open sibling of QuickEditForm for creating simple entities: sends
 * a JSON POST to `endpoint`, resets and refreshes on success.
 */
export default function QuickCreateForm({
  endpoint,
  fields,
  submitLabel = "Add",
}: {
  endpoint: string;
  fields: QuickEditField[];
  submitLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not save"));
        return;
      }

      form.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
          <label
            htmlFor={`qc-${field.name}`}
            className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1"
          >
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={`qc-${field.name}`}
              name={field.name}
              rows={4}
              defaultValue={field.value ?? ""}
              required={field.required}
              className={inputClasses}
            />
          ) : field.type === "select" ? (
            <select
              id={`qc-${field.name}`}
              name={field.name}
              defaultValue={field.value ?? ""}
              required={field.required}
              className={inputClasses}
            >
              {(field.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`qc-${field.name}`}
              name={field.name}
              type={field.type ?? "text"}
              defaultValue={field.value ?? ""}
              required={field.required}
              className={inputClasses}
            />
          )}
        </div>
      ))}

      {error && (
        <p className="sm:col-span-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
