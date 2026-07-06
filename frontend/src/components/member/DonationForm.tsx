"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "./StripePaymentForm";
import type { PayGateway } from "@/lib/api-types";

const CATEGORIES = ["Offering", "Tithe", "Missions", "Building Fund", "Other"];

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

type Step = "form" | "stripe-confirm" | "mpesa-pending" | "success";

export default function DonationForm({ gateways }: { gateways: PayGateway[] }) {
  const [gatewayId, setGatewayId] = useState(gateways[0]?.id ?? 0);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stripeSecret, setStripeSecret] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gateway = gateways.find((g) => g.id === gatewayId);
  const stripePromise = useMemo(
    () => (gateway?.public_key ? loadStripe(gateway.public_key) : null),
    [gateway],
  );

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  async function post(path: string, body: object) {
    const url = path ? `/bff/member/donate/${path}` : "/bff/member/donate";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? data.message ?? "Something went wrong");
    return data;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gateway || !amount) return;
    setError(null);
    setSubmitting(true);

    try {
      if (gateway.gatewayname === "cash") {
        await post("", {
          amount,
          payaccount_id: gateway.id,
          category,
          note,
        });
        setStep("success");
        return;
      }

      if (gateway.gatewayname === "stripe") {
        const data = await post("stripe-intent", {
          amount,
          payaccount_id: gateway.id,
          category,
        });
        setStripeSecret(data.client_secret);
        setStep("stripe-confirm");
        return;
      }

      if (gateway.gatewayname === "mpesa") {
        const data = await post("mpesa-stk", {
          amount,
          phone,
          payaccount_id: gateway.id,
          category,
          note,
        });
        setDonationId(data.donation_id);
        setStep("mpesa-pending");
        startPolling(data.donation_id);
        return;
      }

      if (gateway.gatewayname === "gcash") {
        const data = await post("gcash-init", {
          amount,
          payaccount_id: gateway.id,
          category,
          note,
        });
        window.location.assign(data.checkout_url);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function startPolling(id: number) {
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/bff/member/donate/status/${id}`);
      const data = await res.json().catch(() => ({}));
      if (data.status && data.status !== "pending") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep(data.status === "completed" ? "success" : "form");
        if (data.status !== "completed") {
          setError("M-Pesa payment was not completed. Please try again.");
        }
      }
    }, 3000);
  }

  if (step === "success") {
    return (
      <div className="rounded-sm bg-warm px-8 py-12 text-center" role="status">
        <h3 className="font-display text-2xl text-ink mb-2">Thank you!</h3>
        <p className="text-ink-soft">
          Your generosity helps our community thrive.
        </p>
      </div>
    );
  }

  if (step === "stripe-confirm" && stripeSecret && stripePromise) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: stripeSecret, appearance: { theme: "stripe" } }}
      >
        <StripePaymentForm onSuccess={() => setStep("success")} />
      </Elements>
    );
  }

  if (step === "mpesa-pending") {
    return (
      <div className="text-center py-10" aria-live="polite">
        <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-ink font-medium mb-1">Check your phone</p>
        <p className="text-sm text-ink-soft">
          Enter your M-Pesa PIN to complete the payment. This page updates
          automatically.
        </p>
      </div>
    );
  }

  if (!gateway) {
    return <p className="text-sm text-ink-soft">No giving methods are set up yet.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Give via</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {gateways.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGatewayId(g.id)}
              className={`px-4 py-3 rounded-sm border text-sm font-medium text-left transition-colors ${
                g.id === gatewayId
                  ? "border-primary bg-warm text-primary"
                  : "border-warm-deep text-ink-soft hover:border-primary"
              }`}
            >
              {g.display_name}
            </button>
          ))}
        </div>
      </div>

      {!gateway.is_online && gateway.instructions && (
        <p className="text-sm text-ink-soft bg-warm rounded-sm p-4">
          {gateway.instructions}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-ink mb-2">
            Amount {gateway.currency && `(${gateway.currency})`}
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClasses}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {gateway.gatewayname === "mpesa" && (
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink mb-2">
            M-Pesa Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678"
            className={inputClasses}
          />
        </div>
      )}

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-ink mb-2">
          Note (optional)
        </label>
        <textarea
          id="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {submitting ? "Processing…" : "Give Now"}
      </button>
    </form>
  );
}
