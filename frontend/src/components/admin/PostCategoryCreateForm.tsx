"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function PostCategoryCreateForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/post-categories", {
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

      (document.getElementById("post-category-form") as HTMLFormElement)?.reset();
      router.refresh();
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form id="post-category-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="name" placeholder="Category Name" required className={inputClasses} />
      <input name="description" placeholder="Description" className={inputClasses} />

      {error && (
        <p className="sm:col-span-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="sm:col-span-2 w-fit inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add Category"}
      </button>
    </form>
  );
}
