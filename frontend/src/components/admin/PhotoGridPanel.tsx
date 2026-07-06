"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import DeleteButton from "@/components/admin/DeleteButton";

export default function PhotoGridPanel({
  uploadEndpoint,
  photos,
}: {
  uploadEndpoint: string;
  photos: { id: number; path: string }[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
      if (!res.ok) {
        setError("Could not upload photo");
        return;
      }
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="text-sm text-ink" />
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload Photo"}
        </button>
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-ink-soft">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <Image
                src={photo.path}
                alt=""
                width={200}
                height={200}
                className="w-full h-32 object-cover rounded-sm border border-warm-deep"
              />
              <div className="absolute inset-x-0 bottom-0 p-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                <DeleteButton
                  endpoint={`${uploadEndpoint}/${photo.id}`}
                  confirmText="Remove this photo?"
                  label="Remove"
                  className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-sm bg-white/90 text-red-700 hover:bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
