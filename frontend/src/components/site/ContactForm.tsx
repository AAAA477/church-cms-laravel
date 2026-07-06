"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/public/contact", {
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
        setError("Too many messages — please try again in a few minutes.");
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
      <div
        className="rounded-sm bg-warm px-8 py-12 text-center"
        role="status"
        aria-live="polite"
      >
        <h3 className="font-display text-2xl text-ink mb-2">Thank you!</h3>
        <p className="text-ink-soft">
          Your message has been received. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fullname" className="block text-sm font-medium text-ink mb-2">
            Full Name
          </label>
          <input
            id="fullname"
            name="fullname"
            required
            maxLength={25}
            pattern="[A-Za-z\s]+"
            title="Letters and spaces only"
            placeholder="Jane Doe"
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
            placeholder="jane@example.com"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-ink mb-2">
          Phone
        </label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          required
          pattern="\d{10}"
          title="10-digit phone number"
          placeholder="0501234567"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="query_message" className="block text-sm font-medium text-ink mb-2">
          Message
        </label>
        <textarea
          id="query_message"
          name="query_message"
          required
          maxLength={500}
          rows={5}
          placeholder="How can we help?"
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
