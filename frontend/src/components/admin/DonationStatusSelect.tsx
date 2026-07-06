"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DonationStatusSelect({ donationId, status }: { donationId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleChange(newStatus: string) {
    setBusy(true);
    try {
      const res = await fetch(`/bff/admin/donations/${donationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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
    <select
      defaultValue={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={busy}
      className="rounded-sm border border-warm-deep bg-white px-2 py-1 text-xs text-ink disabled:opacity-60"
    >
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
