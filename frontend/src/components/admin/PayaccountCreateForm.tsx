"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPaymentGateway } from "@/lib/api-types";
import { PAYACCOUNT_FIELDS } from "@/lib/payaccount-fields";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function PayaccountCreateForm({ gateways }: { gateways: AdminPaymentGateway[] }) {
  const router = useRouter();
  const [gatewayId, setGatewayId] = useState<number | "">("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const selectedGateway = gateways.find((g) => g.id === gatewayId);
  const fields = selectedGateway ? (PAYACCOUNT_FIELDS[selectedGateway.gatewayname] ?? []) : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const params = fields.map((f) => (form.get(f.name) as string) || null);

    const payload = {
      paymentgateway_id: gatewayId,
      status: form.get("active") === "on",
      comments: form.get("comments") || null,
      params,
    };

    try {
      const res = await fetch("/bff/admin/payaccounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not create pay account"));
        setStatus("error");
        return;
      }

      router.push("/console/payaccounts");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="gateway" className={labelClasses}>
          Payment Gateway
        </label>
        <select
          id="gateway"
          required
          value={gatewayId}
          onChange={(e) => setGatewayId(Number(e.target.value))}
          className={inputClasses}
        >
          <option value="" disabled>
            Select…
          </option>
          {gateways.map((g) => (
            <option key={g.id} value={g.id}>
              {g.displayname}
            </option>
          ))}
        </select>
      </div>

      {fields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {fields
            .filter((f) => f.name !== "_unused")
            .map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className={labelClasses}>
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.secret ? "password" : "text"}
                  className={inputClasses}
                />
              </div>
            ))}
        </div>
      )}

      <div>
        <label htmlFor="comments" className={labelClasses}>
          Comments
        </label>
        <textarea id="comments" name="comments" rows={2} className={inputClasses} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
        <input type="checkbox" name="active" defaultChecked />
        Active (becomes the only active account for this gateway)
      </label>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !gatewayId}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Creating…" : "Create Pay Account"}
      </button>
    </form>
  );
}
