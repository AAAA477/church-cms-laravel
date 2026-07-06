"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const inputClasses =
  "w-full rounded-sm border border-warm-deep bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const labelClasses = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

export type GroupMessage = {
  id: number;
  mode: string;
  subject: string | null;
  message: string;
  sent_at: string | null;
};

export default function GroupMessagesPanel({ groupId, messages }: { groupId: number; messages: GroupMessage[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"mail" | "sms" | "notification">("notification");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSent(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/bff/admin/groups/${groupId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          subject: form.get("subject") || undefined,
          message: form.get("message"),
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = Object.values(body.errors ?? {}).flat()[0];
        setError(typeof first === "string" ? first : (body.message ?? "Could not send message"));
        return;
      }

      setSent(body.sent ?? 0);
      formRef.current?.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="group-msg-mode" className={labelClasses}>
            Send Via
          </label>
          <select
            id="group-msg-mode"
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
            <label htmlFor="group-msg-subject" className={labelClasses}>
              Subject
            </label>
            <input id="group-msg-subject" name="subject" maxLength={30} className={inputClasses} />
          </div>
        )}

        <div>
          <label htmlFor="group-msg-message" className={labelClasses}>
            Message
          </label>
          <textarea id="group-msg-message" name="message" rows={3} required maxLength={1000} className={inputClasses} />
        </div>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {sent !== null && (
          <p className="text-sm text-green-700" role="status">
            Message sent to {sent} member(s).
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send to All Group Members"}
        </button>
      </form>

      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-2">Message History</h3>
        {messages.length === 0 ? (
          <p className="text-sm text-ink-soft">No messages sent to this group yet.</p>
        ) : (
          <div className="border border-warm-deep rounded-sm divide-y divide-warm-deep">
            {messages.map((m) => (
              <div key={m.id} className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-ink line-clamp-1">{m.subject || m.message}</p>
                  <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-warm text-ink-soft shrink-0">
                    {m.mode}
                  </span>
                </div>
                {m.sent_at && (
                  <p className="text-xs text-ink-soft mt-0.5">{new Date(m.sent_at).toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
