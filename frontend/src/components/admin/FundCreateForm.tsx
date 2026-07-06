"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminFundMember } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function FundCreateForm() {
  const router = useRouter();
  const [membership, setMembership] = useState<"member" | "guest">("member");
  const [method, setMethod] = useState("cash");
  const [members, setMembers] = useState<AdminFundMember[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/bff/admin/funds/members")
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form);
    payload.membership = membership;
    payload.method = method;

    const paymentDetailFields = ["cheque_number", "account_number", "payee_name", "card_name", "bank_name", "payable_at"];
    const paymentDetails: Record<string, string> = {};
    for (const field of paymentDetailFields) {
      if (payload[field]) {
        paymentDetails[field] = payload[field] as string;
        delete payload[field];
      }
    }
    if (Object.keys(paymentDetails).length > 0) payload.payment_details = paymentDetails;

    try {
      const res = await fetch("/bff/admin/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not record contribution"));
        setStatus("error");
        return;
      }

      router.push(`/console/funds/${body.id}`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClasses}>Contributor</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="radio"
              checked={membership === "member"}
              onChange={() => setMembership("member")}
            />
            Existing Member
          </label>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="radio"
              checked={membership === "guest"}
              onChange={() => setMembership("guest")}
            />
            Guest / One-time
          </label>
        </div>

        {membership === "member" ? (
          <select name="user_id" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select member…
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="first_name" placeholder="First Name" required className={inputClasses} />
            <input name="last_name" placeholder="Last Name" className={inputClasses} />
            <input name="mobile_number" placeholder="Mobile Number" className={inputClasses} />
            <input name="address" placeholder="Address" className={inputClasses} />
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className={labelClasses}>
            Amount
          </label>
          <input id="amount" name="amount" type="number" step="0.01" min={0.01} required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="method" className={labelClasses}>
            Method
          </label>
          <select id="method" name="method" value={method} onChange={(e) => setMethod(e.target.value)} className={inputClasses}>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="demanddraft">Demand Draft</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      {method === "cheque" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="cheque_number" placeholder="Cheque Number" className={inputClasses} />
          <input name="account_number" placeholder="Account Number" className={inputClasses} />
          <input name="payee_name" placeholder="Payee Name" className={inputClasses} />
        </div>
      )}
      {method === "card" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="card_name" placeholder="Card Holder Name" className={inputClasses} />
          <input name="bank_name" placeholder="Bank Name" className={inputClasses} />
        </div>
      )}
      {method === "demanddraft" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="payable_at" placeholder="Payable At" className={inputClasses} />
          <input name="account_number" placeholder="Account Number" className={inputClasses} />
        </div>
      )}

      <div>
        <label htmlFor="status" className={labelClasses}>
          Status
        </label>
        <select id="status" name="status" defaultValue="deposited" className={inputClasses}>
          <option value="request">Request</option>
          <option value="pending">Pending</option>
          <option value="deposited">Deposited</option>
          <option value="cancel">Cancelled</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Saving…" : "Record Contribution"}
      </button>
    </form>
  );
}
