"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuoteRescheduleForm({ quoteId }: { quoteId: number }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReschedule() {
    if (!date) return;
    setBusy(true);
    try {
      const res = await fetch(`/bff/admin/quotes/${quoteId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish_on: date }),
      });
      if (!res.ok) {
        alert("Could not reschedule");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-sm border border-warm-deep bg-white px-2 py-1 text-xs text-ink"
      />
      <button
        type="button"
        onClick={handleReschedule}
        disabled={busy || !date}
        className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-sm border border-primary text-primary hover:bg-primary/10 disabled:opacity-60"
      >
        Reschedule
      </button>
    </div>
  );
}
