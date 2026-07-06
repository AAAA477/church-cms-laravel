"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function BulletinCreateForm() {
  const router = useRouter();
  const [type, setType] = useState<"week" | "month">("week");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/bff/admin/bulletins", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create bulletin"));
        setStatus("error");
        return;
      }

      router.push("/console/bulletins");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input id="name" name="name" required className={inputClasses} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className={labelClasses}>
            Type
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "week" | "month")}
            className={inputClasses}
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        {type === "week" ? (
          <div>
            <label htmlFor="week" className={labelClasses}>
              Week #
            </label>
            <input id="week" name="week" type="number" min={1} max={53} required className={inputClasses} />
          </div>
        ) : (
          <div>
            <label htmlFor="month" className={labelClasses}>
              Month #
            </label>
            <input id="month" name="month" type="number" min={1} max={12} required className={inputClasses} />
          </div>
        )}
        <div>
          <label htmlFor="year" className={labelClasses}>
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min={1950}
            defaultValue={new Date().getFullYear()}
            required
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="path" className={labelClasses}>
          Bulletin PDF
        </label>
        <input id="path" name="path" type="file" accept="application/pdf" required className={inputClasses} />
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
        {status === "submitting" ? "Uploading…" : "Upload Bulletin"}
      </button>
    </form>
  );
}
