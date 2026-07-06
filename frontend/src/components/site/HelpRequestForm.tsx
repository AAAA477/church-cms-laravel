"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function HelpRequestForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/bff/public/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 422) {
        const body = await res.json();
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : "Please check your entries.");
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
          Your help request has been submitted and is awaiting review.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-sm shadow-sm p-8">
      <h3 className="font-display text-2xl text-ink">Request Help</h3>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink mb-2">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={255}
          placeholder="What do you need help with?"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={3000}
          rows={4}
          placeholder="Share the details…"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact_details" className="block text-sm font-medium text-ink mb-2">
          Contact details
        </label>
        <input
          id="contact_details"
          name="contact_details"
          required
          maxLength={500}
          placeholder="Phone or email so others can reach you"
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
