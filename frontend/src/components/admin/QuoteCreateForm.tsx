"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function QuoteCreateForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/bff/admin/quotes", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create quote"));
        setStatus("error");
        return;
      }

      router.push("/console/quotes");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="text" className={labelClasses}>
          Quote Text
        </label>
        <textarea id="text" name="text" rows={3} className={inputClasses} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="english_quotes" className={labelClasses}>
            English Scripture (optional)
          </label>
          <textarea id="english_quotes" name="english_quotes" rows={3} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="tamil_quotes" className={labelClasses}>
            Tamil Scripture (optional)
          </label>
          <textarea id="tamil_quotes" name="tamil_quotes" rows={3} className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="image" className={labelClasses}>
          Image (optional)
        </label>
        <input id="image" name="image" type="file" accept="image/*" className={inputClasses} />
      </div>

      <div>
        <label htmlFor="publish_on" className={labelClasses}>
          Publish On
        </label>
        <input id="publish_on" name="publish_on" type="datetime-local" required className={inputClasses} />
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
        {status === "submitting" ? "Creating…" : "Create Quote"}
      </button>
    </form>
  );
}
