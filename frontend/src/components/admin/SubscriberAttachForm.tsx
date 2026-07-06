"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminMailingList } from "@/lib/api-types";

export default function SubscriberAttachForm({
  subscriberId,
  mailingLists,
}: {
  subscriberId: number;
  mailingLists: AdminMailingList[];
}) {
  const router = useRouter();
  const [listId, setListId] = useState("");
  const [busy, setBusy] = useState(false);

  async function attach() {
    if (!listId) return;
    setBusy(true);
    try {
      const res = await fetch("/bff/admin/subscribers/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriber_id: subscriberId, mailing_list_id: Number(listId) }),
      });
      if (!res.ok) {
        alert("Could not attach to list");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={listId}
        onChange={(e) => setListId(e.target.value)}
        className="rounded-sm border border-warm-deep bg-white px-2 py-1 text-xs text-ink"
      >
        <option value="">Attach to list…</option>
        {mailingLists.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={attach}
        disabled={busy || !listId}
        className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-sm border border-primary text-primary hover:bg-primary/10 disabled:opacity-60"
      >
        Attach
      </button>
    </div>
  );
}
