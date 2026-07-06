"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

/**
 * Upload form for the media library. Mirrors the legacy Video/Audio/Image
 * create forms: images are always file uploads; audio/video can be either
 * an uploaded file or an external URL.
 */
export default function MediaUploadForm({ mediaType }: { mediaType: "image" | "video" | "audio" }) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"file" | "url">("file");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("media_type", mediaType);
    data.set("type", sourceType);

    try {
      const res = await fetch("/bff/admin/mediafiles", { method: "POST", body: data });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Upload failed"));
        return;
      }

      form.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="mu-name" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
          Name
        </label>
        <input id="mu-name" name="name" required maxLength={255} className={inputClasses} />
      </div>

      {mediaType !== "image" && (
        <div>
          <label htmlFor="mu-source" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
            Source
          </label>
          <select
            id="mu-source"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as "file" | "url")}
            className={inputClasses}
          >
            <option value="file">Upload file</option>
            <option value="url">External URL</option>
          </select>
        </div>
      )}

      {sourceType === "url" && mediaType !== "image" ? (
        <div className="sm:col-span-2">
          <label htmlFor="mu-url" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
            URL
          </label>
          <input id="mu-url" name="url" type="url" required placeholder="https://…" className={inputClasses} />
        </div>
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor="mu-file" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
            File
          </label>
          <input
            id="mu-file"
            name="file"
            type="file"
            required
            accept={mediaType === "image" ? "image/*" : mediaType === "video" ? "video/*" : "audio/*"}
            className={inputClasses}
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="mu-description" className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
          Description
        </label>
        <textarea id="mu-description" name="description" rows={2} maxLength={1000} className={inputClasses} />
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Add File"}
        </button>
      </div>
    </form>
  );
}
