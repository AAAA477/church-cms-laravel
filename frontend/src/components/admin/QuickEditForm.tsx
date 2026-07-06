"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export type QuickEditField = {
  name: string;
  label: string;
  value: string | number | null;
  type?: "text" | "textarea" | "number" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
};

/**
 * Small inline "Edit" toggle + form for simple entities (categories,
 * mailing lists, campaigns…). Sends a JSON PUT to `endpoint` with the
 * field values and refreshes the page on success.
 */
export default function QuickEditForm({ endpoint, fields }: { endpoint: string; fields: QuickEditField[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not save changes"));
        return;
      }

      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-primary text-primary hover:bg-primary/10"
      >
        Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full mt-2 grid gap-2 sm:grid-cols-2 border-t border-warm-deep pt-3">
      {fields.map((field) => (
        <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
          <label htmlFor={`qe-${field.name}`} className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={`qe-${field.name}`}
              name={field.name}
              rows={2}
              defaultValue={field.value ?? ""}
              required={field.required}
              className={inputClasses}
            />
          ) : field.type === "select" ? (
            <select
              id={`qe-${field.name}`}
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
              id={`qe-${field.name}`}
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

      <div className="sm:col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm border border-ink-soft text-ink-soft hover:bg-warm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
