"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";
type Category = { id: number; name: string };

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function PrayerRequestForm({ categories }: { categories: Category[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/bff/public/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.text,
          category_id: data.category_id || null,
        }),
      });

      if (res.status === 422) {
        const body = await res.json();
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : "Please check your entry.");
        setStatus("error");
        return;
      }

      if (res.status === 429) {
        setError("Too many requests — please try again in a few minutes.");
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm bg-warm px-8 py-12 text-center" role="status" aria-live="polite">
        <h3 className="font-display text-2xl text-ink mb-2">Thank you</h3>
        <p className="text-ink-soft">
          Your prayer request has been submitted and is awaiting approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-sm shadow-sm p-8">
      <h3 className="font-display text-2xl text-ink">Submit a Prayer Request</h3>

      {categories.length > 0 && (
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-ink mb-2">
            Category (optional)
          </label>
          <select id="category_id" name="category_id" className={inputClasses} defaultValue="">
            <option value="">General</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-ink mb-2">
          Your prayer request
        </label>
        <textarea
          id="text"
          name="text"
          required
          minLength={10}
          maxLength={500}
          rows={4}
          placeholder="Share what's on your heart…"
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}
