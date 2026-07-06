"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function ChangePasswordForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not change password"));
        setStatus("error");
        return;
      }

      setStatus("success");
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="oldpassword" className={labelClasses}>
          Current Password
        </label>
        <input id="oldpassword" name="oldpassword" type="password" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="newpassword" className={labelClasses}>
          New Password
        </label>
        <input id="newpassword" name="newpassword" type="password" required minLength={8} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="newpassword_confirmation" className={labelClasses}>
          Confirm New Password
        </label>
        <input
          id="newpassword_confirmation"
          name="newpassword_confirmation"
          type="password"
          required
          minLength={8}
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-700" role="status">
          Password changed.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Saving…" : "Change Password"}
      </button>
    </form>
  );
}
