"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function PrayerCategoryCreateForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/bff/admin/prayer-categories", {
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

      (document.getElementById("category-form") as HTMLFormElement)?.reset();
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form id="category-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input id="name" name="name" required maxLength={50} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="emoji" className={labelClasses}>
          Emoji
        </label>
        <input id="emoji" name="emoji" required maxLength={10} defaultValue="🙏" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="css_class" className={labelClasses}>
          CSS Class
        </label>
        <input id="css_class" name="css_class" required maxLength={50} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="sort_order" className={labelClasses}>
          Sort Order
        </label>
        <input id="sort_order" name="sort_order" type="number" min={0} required defaultValue={0} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="display_color" className={labelClasses}>
          Display Color
        </label>
        <input id="display_color" name="display_color" type="color" required defaultValue="#8b6f47" className={`${inputClasses} h-11`} />
      </div>
      <div>
        <label htmlFor="gradient_start" className={labelClasses}>
          Gradient Start
        </label>
        <input id="gradient_start" name="gradient_start" type="color" required defaultValue="#f5f1eb" className={`${inputClasses} h-11`} />
      </div>
      <div>
        <label htmlFor="gradient_end" className={labelClasses}>
          Gradient End
        </label>
        <input id="gradient_end" name="gradient_end" type="color" required defaultValue="#c4a574" className={`${inputClasses} h-11`} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClasses}>
          Description
        </label>
        <textarea id="description" name="description" rows={2} maxLength={500} className={inputClasses} />
      </div>

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
