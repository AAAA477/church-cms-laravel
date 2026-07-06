"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function FaqCategoryCreateForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/faq-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create category"));
        setStatus("error");
        return;
      }

      (document.getElementById("faq-category-form") as HTMLFormElement)?.reset();
      router.refresh();
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form id="faq-category-form" onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-start">
      <input name="name" placeholder="Category Name" required className={`flex-1 min-w-[200px] ${inputClasses}`} />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="text-xs font-medium uppercase tracking-wider px-6 py-2.5 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add"}
      </button>
      {error && (
        <p className="w-full text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
