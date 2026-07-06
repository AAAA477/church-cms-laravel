"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import type { Notification } from "@/lib/api-types";

async function post(path: string) {
  await fetch(`/bff/member/notifications/${path}`, { method: "POST" });
}

export default function NotificationList({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  function markRead(id: string) {
    if (readIds.has(id)) return;
    setReadIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await post(`read/${id}`);
      router.refresh();
    });
  }

  function markAllRead() {
    startTransition(async () => {
      await post("allread");
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return <p className="text-sm text-ink-soft">No notifications yet.</p>;
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={markAllRead}
            disabled={pending}
            className="text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-60"
          >
            Mark all as read
          </button>
        </div>
      )}
      <ul className="divide-y divide-warm-deep">
        {notifications.map((n) => {
          const isUnread = !n.read_at && !readIds.has(n.id);
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className="w-full flex items-start gap-3 py-4 text-left"
              >
                <span
                  className={clsx(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0",
                    isUnread ? "bg-primary" : "bg-transparent",
                  )}
                  aria-hidden
                />
                <div>
                  <p className={clsx("text-sm", isUnread ? "text-ink font-medium" : "text-ink-soft")}>
                    {n.web_message}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">{n.created_at}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
