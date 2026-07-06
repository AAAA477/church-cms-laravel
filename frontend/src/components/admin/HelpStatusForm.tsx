"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminHelp } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function HelpStatusForm({ help }: { help: AdminHelp }) {
  const router = useRouter();
  const [statusValue, setStatusValue] = useState<AdminHelp["status"]>(help.status);
  const [expiredAt, setExpiredAt] = useState(7);
  const [comments, setComments] = useState(help.comments ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload: Record<string, unknown> = { status: statusValue };
    if (statusValue === "approve") {
      payload.expired_at = expiredAt;
    } else {
      payload.comments = comments;
    }

    try {
      const res = await fetch(`/bff/admin/helps/${help.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Could not update status");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className={labelClasses}>
          Status
        </label>
        <select
          id="status"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value as AdminHelp["status"])}
          className={inputClasses}
        >
          <option value="pending">Pending</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="close">Close</option>
        </select>
      </div>

      {statusValue === "approve" ? (
        <div>
          <label htmlFor="expired_at" className={labelClasses}>
            Expires In (days)
          </label>
          <input
            id="expired_at"
            type="number"
            min={1}
            value={expiredAt}
            onChange={(e) => setExpiredAt(Number(e.target.value))}
            className={inputClasses}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="comments" className={labelClasses}>
            Comments
          </label>
          <textarea
            id="comments"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={inputClasses}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {busy ? "Saving…" : "Update Status"}
      </button>
    </form>
  );
}
