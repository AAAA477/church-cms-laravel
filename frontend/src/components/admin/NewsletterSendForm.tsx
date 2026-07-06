"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function NewsletterSendForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/bff/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Send failed"));
        return;
      }

      form.reset();
      setSuccess(body.message ?? "Newsletter queued.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nl-to" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
          Send To
        </label>
        <select id="nl-to" name="to" defaultValue="1" className={inputClasses}>
          <option value="1">Subscribed members</option>
          <option value="0">Unsubscribed members</option>
        </select>
      </div>

      <div>
        <label htmlFor="nl-subject" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
          Subject
        </label>
        <input id="nl-subject" name="subject" required maxLength={255} className={inputClasses} />
      </div>

      <div>
        <label htmlFor="nl-message" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
          Message
        </label>
        <textarea id="nl-message" name="message" required rows={8} className={inputClasses} />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="text-xs font-medium uppercase tracking-wider px-5 py-2.5 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send Newsletter"}
      </button>
    </form>
  );
}
