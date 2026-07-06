"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FeedbackMessageActions({ messageId, isSeen }: { messageId: number; isSeen: string | number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "has_seen" | "action_taken") {
    setBusy(true);
    try {
      const res = await fetch(`/bff/admin/feedbacks/messages/${messageId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        alert("Could not update status");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      {isSeen !== "has_seen" && (
        <button
          type="button"
          onClick={() => setStatus("has_seen")}
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-primary text-primary hover:bg-primary/10 disabled:opacity-60"
        >
          Mark Seen
        </button>
      )}
      {isSeen !== "action_taken" && (
        <button
          type="button"
          onClick={() => setStatus("action_taken")}
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-60"
        >
          Action Taken
        </button>
      )}
    </div>
  );
}
