"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AvatarUploadForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/bff/admin/profile/avatar", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Could not update avatar");
        setStatus("error");
        return;
      }

      router.refresh();
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        name="avatar"
        type="file"
        accept="image/*"
        required
        className="text-sm text-ink file:mr-3 file:rounded-sm file:border-0 file:bg-warm file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Uploading…" : "Update Avatar"}
      </button>
      {error && (
        <p className="w-full text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
