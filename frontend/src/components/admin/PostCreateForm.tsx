"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPostCategory } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function PostCreateForm({ categories }: { categories: AdminPostCategory[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [postLater, setPostLater] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data: Record<string, FormDataEntryValue | boolean> = Object.fromEntries(
      new FormData(e.currentTarget),
    );
    // The API expects a boolean post_later; the scheduler command
    // (gego:publishscheduledposts) publishes it when posted_at arrives.
    data.post_later = postLater;
    if (!postLater) delete data.posted_at;

    try {
      const res = await fetch("/bff/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create post"));
        setStatus("error");
        return;
      }

      router.push(`/console/posts/${body.id}`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClasses}>
          Title
        </label>
        <input id="title" name="title" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="category_id" className={labelClasses}>
          Category
        </label>
        <select id="category_id" name="category_id" defaultValue="" className={inputClasses}>
          <option value="">—</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className={labelClasses}>
          Content
        </label>
        <textarea id="description" name="description" rows={5} required className={inputClasses} />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={postLater}
            onChange={(e) => setPostLater(e.target.checked)}
            className="accent-[var(--color-primary)]"
          />
          Schedule for later
        </label>
        {postLater && (
          <div className="mt-3">
            <label htmlFor="posted_at" className={labelClasses}>
              Publish at
            </label>
            <input
              id="posted_at"
              name="posted_at"
              type="datetime-local"
              required
              className={inputClasses}
            />
            <p className="mt-1.5 text-xs text-ink-soft">
              The devotion stays hidden until this time, then publishes automatically.
            </p>
          </div>
        )}
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
        {status === "submitting" ? "Publishing…" : postLater ? "Schedule" : "Publish Now"}
      </button>
    </form>
  );
}
