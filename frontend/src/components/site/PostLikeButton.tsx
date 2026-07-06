"use client";

import { useState } from "react";

export default function PostLikeButton({
  kind,
  id,
  initialCount,
}: {
  kind: "post" | "comment";
  id: number;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    const endpoint = kind === "post" ? `/bff/public/post-like/${id}` : `/bff/public/comment-like/${id}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: next }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count);
      setLiked(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        liked
          ? "inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          : "inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary transition-colors"
      }
      aria-pressed={liked}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      {count > 0 ? count : ""} {count === 1 ? "Like" : "Likes"}
    </button>
  );
}
