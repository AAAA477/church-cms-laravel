"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function RegisterForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const registerRes = await fetch("/bff/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!registerRes.ok) {
        const body = await registerRes.json().catch(() => ({}));
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(
          typeof first === "string" ? first : (body.message ?? "Registration failed"),
        );
        setStatus("error");
        return;
      }

      const loginRes = await fetch("/bff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!loginRes.ok) {
        // Registered fine but auto-login failed — send them to sign in manually.
        router.push("/member/login");
        return;
      }

      router.push("/member");
      router.refresh();
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-ink mb-2">
            First Name
          </label>
          <input
            id="firstname"
            name="firstname"
            required
            maxLength={15}
            pattern="[A-Za-z\s]+"
            placeholder="Jane"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-ink mb-2">
            Gender
          </label>
          <select id="gender" name="gender" required className={inputClasses}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-ink mb-2">
            Date of Birth
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            required
            max={new Date().toISOString().split("T")[0]}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="mobile_no" className="block text-sm font-medium text-ink mb-2">
            Mobile Number
          </label>
          <input
            id="mobile_no"
            name="mobile_no"
            type="tel"
            required
            pattern="\d{10}"
            title="10-digit phone number"
            placeholder="0501234567"
            className={inputClasses}
          />
        </div>
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
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClasses}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-medium text-ink mb-2"
          >
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm transition-all duration-300 rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
