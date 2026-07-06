"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PersonStatusActions({
  resource,
  personId,
  currentStatus,
  entityLabel = "member",
}: {
  resource: "members" | "guests";
  personId: number;
  currentStatus: string | null;
  entityLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: "active" | "inactive" | "exit") {
    if (status === "exit" && !confirm(`Exit this ${entityLabel}? They will be removed from all groups.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/admin/${resource}/${personId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("Could not update status");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete this ${entityLabel} permanently? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/admin/${resource}/${personId}`, { method: "DELETE" });
      if (!res.ok) {
        setError(`Could not delete ${entityLabel}`);
        return;
      }
      router.push(`/console/${resource}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus !== "active" && (
        <button
          type="button"
          onClick={() => setStatus("active")}
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-60"
        >
          Activate
        </button>
      )}
      {currentStatus !== "inactive" && (
        <button
          type="button"
          onClick={() => setStatus("inactive")}
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-amber-600 text-amber-700 hover:bg-amber-50 disabled:opacity-60"
        >
          Deactivate
        </button>
      )}
      {currentStatus !== "exit" && (
        <button
          type="button"
          onClick={() => setStatus("exit")}
          disabled={busy}
          className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-ink-soft text-ink-soft hover:bg-warm disabled:opacity-60"
        >
          Mark as Exited
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        Delete
      </button>
      {error && (
        <p className="text-sm text-red-700 w-full" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
