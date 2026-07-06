"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function WidgetCreateForm() {
  const router = useRouter();
  const [page, setPage] = useState("home");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create widget"));
        setStatus("error");
        return;
      }

      (document.getElementById("widget-form") as HTMLFormElement)?.reset();
      router.refresh();
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form id="widget-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="page" className={labelClasses}>
            Page
          </label>
          <input
            id="page"
            name="page"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="home"
            className={inputClasses}
          />
        </div>
        {page !== "home" && (
          <div>
            <label htmlFor="position" className={labelClasses}>
              Position
            </label>
            <select id="position" name="position" defaultValue="top" className={inputClasses}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        )}
        <div>
          <label htmlFor="display_order" className={labelClasses}>
            Display Order
          </label>
          <input id="display_order" name="display_order" type="number" min={0} defaultValue={0} className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="content" className={labelClasses}>
          Content (HTML)
        </label>
        <textarea id="content" name="content" rows={4} required className={inputClasses} />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-fit inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add Widget"}
      </button>
    </form>
  );
}
