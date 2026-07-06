"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export default function PostCommentForm({ postId }: { postId: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`/bff/public/post-comment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 422) {
        const body = await res.json();
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : "Please check your comment.");
        setStatus("error");
        return;
      }

      if (res.status === 429) {
        setError("Too many comments — please try again in a few minutes.");
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
      router.refresh();
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-primary" role="status" aria-live="polite">
        Your comment has been submitted and is awaiting moderation. Thank you!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="comment"
        required
        maxLength={1000}
        rows={3}
        placeholder="Add a comment…"
        className="w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      />
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Posting…" : "Post Comment"}
      </Button>
    </form>
  );
}
