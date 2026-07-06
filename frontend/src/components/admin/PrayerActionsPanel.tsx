"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPrayerDetail } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function PrayerActionsPanel({ prayer }: { prayer: AdminPrayerDetail }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState(30);
  const [rejectReason, setRejectReason] = useState("");
  const [testimony, setTestimony] = useState("");
  const [additionalDays, setAdditionalDays] = useState(30);

  async function post(action: string, body?: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/admin/prayer-board/${prayer.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Action failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {prayer.status === "PENDING" && (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                Expiry (days)
              </label>
              <input
                type="number"
                min={1}
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <button
              type="button"
              onClick={() => post("approve", { expiry_days: expiryDays })}
              disabled={busy}
              className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              Approve
            </button>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                Rejection Reason
              </label>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className={inputClasses}
              />
            </div>
            <button
              type="button"
              onClick={() => post("reject", { reason: rejectReason })}
              disabled={busy || !rejectReason}
              className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {prayer.status === "ACTIVE" && (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                Testimony (optional)
              </label>
              <input value={testimony} onChange={(e) => setTestimony(e.target.value)} className={inputClasses} />
            </div>
            <button
              type="button"
              onClick={() => post("mark-answered", { testimony: testimony || null })}
              disabled={busy}
              className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
            >
              Mark Answered
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {prayer.pinned ? (
              <button
                type="button"
                onClick={() => post("unpin")}
                disabled={busy}
                className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-ink-soft text-ink-soft hover:bg-warm disabled:opacity-60"
              >
                Unpin
              </button>
            ) : (
              <button
                type="button"
                onClick={() => post("pin")}
                disabled={busy}
                className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-primary text-primary hover:bg-primary/10 disabled:opacity-60"
              >
                Pin
              </button>
            )}

            <select
              onChange={(e) => setAdditionalDays(Number(e.target.value))}
              value={additionalDays}
              className="rounded-sm border border-warm-deep bg-white px-2 py-1 text-xs text-ink"
            >
              {[7, 14, 30, 60].map((d) => (
                <option key={d} value={d}>
                  +{d} days
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => post("extend", { additional_days: additionalDays })}
              disabled={busy}
              className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-primary text-primary hover:bg-primary/10 disabled:opacity-60"
            >
              Extend
            </button>

            <button
              type="button"
              onClick={() => post("unpublish")}
              disabled={busy}
              className="text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Unpublish
            </button>
          </div>
        </div>
      )}

      {!["PENDING", "ACTIVE"].includes(prayer.status) && (
        <p className="text-sm text-ink-soft">No further actions available for this status.</p>
      )}
    </div>
  );
}
