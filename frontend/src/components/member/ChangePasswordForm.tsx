"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

type Status = "idle" | "submitting" | "success" | "error";

export default function ChangePasswordForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/bff/member/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(
          typeof first === "string"
            ? first
            : (body.message ?? "Could not change password"),
        );
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm bg-warm px-8 py-10 text-center" role="status">
        <p className="font-display text-2xl text-ink mb-2">Password updated</p>
        <p className="text-ink-soft text-sm">
          Your password has been changed successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label htmlFor="oldpassword" className="block text-sm font-medium text-ink mb-2">
          Current Password
        </label>
        <input
          id="oldpassword"
          name="oldpassword"
          type="password"
          required
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="newpassword" className="block text-sm font-medium text-ink mb-2">
          New Password
        </label>
        <input
          id="newpassword"
          name="newpassword"
          type="password"
          required
          minLength={8}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="confirmpassword" className="block text-sm font-medium text-ink mb-2">
          Confirm New Password
        </label>
        <input
          id="confirmpassword"
          name="confirmpassword"
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

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
