"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GroupMessageForm({ groupId }: { groupId: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const message = new FormData(form).get("message") as string;
    if (!message.trim()) return;

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/member/group-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, message }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.errors?.auth?.[0] ?? body.message ?? "Could not send message");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        name="message"
        required
        maxLength={1000}
        rows={3}
        placeholder="Share something with the group…"
        className="w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      />
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="self-end inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-6 py-2.5 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Post"}
      </button>
    </form>
  );
}
