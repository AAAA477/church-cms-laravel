"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPageCategory, AdminPageDetail } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function PageEditForm({ page, categories }: { page: AdminPageDetail; categories: AdminPageCategory[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch(`/bff/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not save changes"));
        setStatus("error");
        return;
      }

      setStatus("success");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="page_name" className={labelClasses}>
            Page Name
          </label>
          <input id="page_name" name="page_name" defaultValue={page.page_name} required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="category_id" className={labelClasses}>
            Category
          </label>
          <select id="category_id" name="category_id" defaultValue={page.category_id} className={inputClasses}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={page.description}
          required
          className={inputClasses}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="menu_text" className={labelClasses}>
            Menu Text
          </label>
          <input id="menu_text" name="menu_text" defaultValue={page.menu_text ?? ""} maxLength={80} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="menu_order" className={labelClasses}>
            Menu Order
          </label>
          <input
            id="menu_order"
            name="menu_order"
            type="number"
            defaultValue={page.menu_order}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="meta_title" className={labelClasses}>
          Meta Title
        </label>
        <input id="meta_title" name="meta_title" defaultValue={page.meta_title ?? ""} maxLength={60} className={inputClasses} />
      </div>

      <div>
        <label htmlFor="meta_description" className={labelClasses}>
          Meta Description
        </label>
        <textarea
          id="meta_description"
          name="meta_description"
          rows={2}
          defaultValue={page.meta_description ?? ""}
          maxLength={160}
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
          Changes saved — a new version was recorded.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
