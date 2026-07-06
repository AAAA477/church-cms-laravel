"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminEventDetail } from "@/lib/api-types";
import { EVENT_CATEGORY_OPTIONS, EVENT_FREQ_TERM_OPTIONS, EVENT_SELECT_TYPE_OPTIONS } from "@/lib/event-options";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

function toDatetimeLocal(value: string): string {
  return value.replace(" ", "T").slice(0, 16);
}

export default function EventEditForm({ event }: { event: AdminEventDetail }) {
  const router = useRouter();
  const [repeats, setRepeats] = useState(event.repeats);
  const [publishToWeb, setPublishToWeb] = useState(event.publish_to_web);
  const [enableGallery, setEnableGallery] = useState(event.enable_gallery);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form);
    payload.repeats = repeats;
    payload.publish_to_web = publishToWeb;
    payload.enable_gallery = enableGallery;
    if (!repeats) {
      delete payload.freq;
      delete payload.freq_term;
    }

    try {
      const res = await fetch(`/bff/admin/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div>
        <label htmlFor="title" className={labelClasses}>
          Title
        </label>
        <input id="title" name="title" defaultValue={event.title} required maxLength={100} className={inputClasses} />
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={event.description ?? ""}
          className={inputClasses}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="select_type" className={labelClasses}>
            Visibility
          </label>
          <select id="select_type" name="select_type" defaultValue={event.select_type ?? ""} className={inputClasses}>
            <option value="">—</option>
            {EVENT_SELECT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className={labelClasses}>
            Category
          </label>
          <select id="category" name="category" defaultValue={event.category ?? ""} className={inputClasses}>
            <option value="">—</option>
            {EVENT_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className={labelClasses}>
            Location
          </label>
          <input id="location" name="location" defaultValue={event.location ?? ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="organised_by" className={labelClasses}>
            Organised By
          </label>
          <input
            id="organised_by"
            name="organised_by"
            defaultValue={event.organised_by ?? ""}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className={labelClasses}>
            Start
          </label>
          <input
            id="start_date"
            name="start_date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(event.start_date)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="end_date" className={labelClasses}>
            End
          </label>
          <input
            id="end_date"
            name="end_date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(event.end_date)}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} />
          Repeats
        </label>
      </div>

      {repeats && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="freq" className={labelClasses}>
              Every
            </label>
            <input
              id="freq"
              name="freq"
              type="number"
              min={1}
              defaultValue={event.freq ?? 1}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="freq_term" className={labelClasses}>
              Frequency
            </label>
            <select id="freq_term" name="freq_term" defaultValue={event.freq_term ?? "week"} className={inputClasses}>
              {EVENT_FREQ_TERM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" checked={publishToWeb} onChange={(e) => setPublishToWeb(e.target.checked)} />
          Publish to Web
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" checked={enableGallery} onChange={(e) => setEnableGallery(e.target.checked)} />
          Enable Gallery
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-700" role="status">
          Changes saved.
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
