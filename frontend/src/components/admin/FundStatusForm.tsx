"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminFundDetail } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function FundStatusForm({ fund }: { fund: AdminFundDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(fund.status);
  const [comments, setComments] = useState(fund.comments ?? "");
  const [amount, setAmount] = useState(String(fund.amount));
  const [method, setMethod] = useState(fund.method);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/bff/admin/funds/${fund.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method,
          status,
          comments: status === "cancel" ? comments : undefined,
        }),
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className={labelClasses}>
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="method" className={labelClasses}>
            Method
          </label>
          <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className={inputClasses}>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="demanddraft">Demand Draft</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="status" className={labelClasses}>
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminFundDetail["status"])}
          className={inputClasses}
        >
          <option value="request">Request</option>
          <option value="pending">Pending</option>
          <option value="deposited">Deposited</option>
          <option value="cancel">Cancelled</option>
        </select>
      </div>

      {status === "cancel" && (
        <div>
          <label htmlFor="comments" className={labelClasses}>
            Cancellation Reason
          </label>
          <textarea
            id="comments"
            rows={2}
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
