"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CampaignStatusToggle({ campaignId, active }: { campaignId: number; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/bff/admin/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !active }),
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
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        active
          ? "text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-60"
          : "text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full bg-warm text-ink-soft hover:bg-warm-deep disabled:opacity-60"
      }
    >
      {active ? "Active" : "Draft"}
    </button>
  );
}
