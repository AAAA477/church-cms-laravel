"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPayaccountDetail } from "@/lib/api-types";
import { PAYACCOUNT_FIELDS } from "@/lib/payaccount-fields";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function PayaccountEditForm({ payaccount }: { payaccount: AdminPayaccountDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const fields = PAYACCOUNT_FIELDS[payaccount.gateway_name ?? ""] ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const params = fields.map((f) => (f.name === "_unused" ? null : (form.get(f.name) as string) || null));

    try {
      const res = await fetch(`/bff/admin/payaccounts/${payaccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments: form.get("comments") || null,
          params,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Could not save changes");
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
      {fields.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f, i) =>
            f.name === "_unused" ? null : (
              <div key={f.name}>
                <label htmlFor={f.name} className={labelClasses}>
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.secret ? "password" : "text"}
                  defaultValue={payaccount.params[i] ?? ""}
                  className={inputClasses}
                />
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">This gateway has no configurable credentials.</p>
      )}

      <div>
        <label htmlFor="comments" className={labelClasses}>
          Comments
        </label>
        <textarea id="comments" name="comments" rows={2} defaultValue={payaccount.comments ?? ""} className={inputClasses} />
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
