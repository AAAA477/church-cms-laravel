"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminMessageRecipient } from "@/lib/api-types";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export default function MessageSendForm() {
  const router = useRouter();
  const [membershipType, setMembershipType] = useState<"member" | "guest">("member");
  const [search, setSearch] = useState("");
  const [recipients, setRecipients] = useState<AdminMessageRecipient[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [mode, setMode] = useState<"mail" | "sms" | "notification">("notification");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function searchRecipients(query: string, type: "member" | "guest") {
    setSearch(query);
    const params = new URLSearchParams({ membership_type: type, search: query });
    const res = await fetch(`/bff/admin/messages/recipients?${params}`);
    if (res.ok) setRecipients(await res.json());
  }

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/bff/admin/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: selected,
          mode,
          subject: form.get("subject") || undefined,
          message: form.get("message"),
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not send message"));
        setStatus("error");
        return;
      }

      router.push("/console/messages");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClasses}>Recipients</label>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="radio"
              checked={membershipType === "member"}
              onChange={() => {
                setMembershipType("member");
                searchRecipients(search, "member");
              }}
            />
            Members
          </label>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="radio"
              checked={membershipType === "guest"}
              onChange={() => {
                setMembershipType("guest");
                searchRecipients(search, "guest");
              }}
            />
            Guests
          </label>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => searchRecipients(e.target.value, membershipType)}
          placeholder="Search recipients…"
          className={inputClasses}
        />
        {recipients.length > 0 && (
          <div className="mt-2 border border-warm-deep rounded-sm divide-y divide-warm-deep max-h-48 overflow-y-auto">
            {recipients.map((r) => (
              <label key={r.id} className="flex items-center gap-2 px-3 py-2 text-sm text-ink cursor-pointer hover:bg-warm/50">
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                {r.name}
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-ink-soft mt-1">{selected.length} recipient(s) selected</p>
      </div>

      <div>
        <label htmlFor="mode" className={labelClasses}>
          Send Via
        </label>
        <select
          id="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as "mail" | "sms" | "notification")}
          className={inputClasses}
        >
          <option value="notification">App Notification</option>
          <option value="mail">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {mode === "mail" && (
        <div>
          <label htmlFor="subject" className={labelClasses}>
            Subject
          </label>
          <input id="subject" name="subject" maxLength={30} className={inputClasses} />
        </div>
      )}

      <div>
        <label htmlFor="message" className={labelClasses}>
          Message
        </label>
        <textarea id="message" name="message" rows={4} required maxLength={1000} className={inputClasses} />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || selected.length === 0}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
