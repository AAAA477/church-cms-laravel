"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { AdminSermonLink } from "@/lib/api-types";
import DeleteButton from "@/components/admin/DeleteButton";
import { youtubeId } from "@/lib/youtube";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function SermonLinksPanel({ sermonId, links }: { sermonId: number; links: AdminSermonLink[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const previewId = youtubeId(videoLink);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/bff/admin/sermons/${sermonId}/links`, { method: "POST", body: formData });
      if (!res.ok) {
        setError("Could not add link");
        return;
      }
      formRef.current?.reset();
      setVideoLink("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input name="title" placeholder="Title (optional)" className={inputClasses} />
        <input name="date" type="date" required className={inputClasses} />
        <input
          name="video_link"
          placeholder="Video URL (paste a YouTube link to embed it)"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          className={`${inputClasses} sm:col-span-2`}
        />
        {previewId && (
          <div className="sm:col-span-2 relative aspect-video w-full max-w-sm overflow-hidden rounded-sm bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview thumbnail */}
            <img
              src={`https://i.ytimg.com/vi/${previewId}/hqdefault.jpg`}
              alt="YouTube preview"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium uppercase tracking-wide bg-black/70 text-white px-1.5 py-0.5 rounded-sm">
              Will embed on the site
            </span>
          </div>
        )}
        <input name="audio_link" placeholder="Audio URL" className={inputClasses} />
        <input name="pdf_link" type="file" accept="application/pdf" className={`${inputClasses} sm:col-span-2`} />
        <button
          type="submit"
          disabled={busy}
          className="sm:col-span-2 text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60 w-fit"
        >
          {busy ? "Adding…" : "Add Link"}
        </button>
        {error && (
          <p className="sm:col-span-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </form>

      {links.length === 0 ? (
        <p className="text-sm text-ink-soft">No links yet.</p>
      ) : (
        <div className="border border-warm-deep rounded-sm divide-y divide-warm-deep">
          {links.map((link) => (
            <div key={link.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <div>
                <p className="text-sm text-ink">{link.title || "Untitled"}</p>
                <p className="text-xs text-ink-soft">
                  {new Date(link.date).toLocaleDateString()}
                  {link.video_link && " · video"}
                  {link.audio_link && " · audio"}
                  {link.pdf_link && " · pdf"}
                </p>
              </div>
              <DeleteButton
                endpoint={`/bff/admin/sermons/${sermonId}/links/${link.id}`}
                confirmText="Remove this link?"
                label="Remove"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
