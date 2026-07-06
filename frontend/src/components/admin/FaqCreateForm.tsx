"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminFaqCategory } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function FaqCreateForm({ categories }: { categories: AdminFaqCategory[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create FAQ"));
        setStatus("error");
        return;
      }

      (document.getElementById("faq-form") as HTMLFormElement)?.reset();
      router.refresh();
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form id="faq-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="faq_category_id" className={labelClasses}>
          Category
        </label>
        <select id="faq_category_id" name="faq_category_id" required defaultValue="" className={inputClasses}>
          <option value="" disabled>
            Select…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="question" className={labelClasses}>
          Question
        </label>
        <input id="question" name="question" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="answer" className={labelClasses}>
          Answer
        </label>
        <textarea id="answer" name="answer" rows={3} required className={inputClasses} />
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
        {status === "submitting" ? "Adding…" : "Add FAQ"}
      </button>
    </form>
  );
}
