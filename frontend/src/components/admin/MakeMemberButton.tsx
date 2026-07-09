"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Converts a guest into a member. Used inside the guests table (whose rows
 * are links, hence the propagation stops) and on the guest detail page.
 */
export default function MakeMemberButton({
  guestId,
  name,
  redirectTo,
}: {
  guestId: number;
  name?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Make ${name ?? "this guest"} a member?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/bff/admin/guests/${guestId}/make-member`, { method: "POST" });
      if (!res.ok) {
        alert("Could not convert this guest. Please try again.");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-primary text-primary hover:bg-warm disabled:opacity-60 whitespace-nowrap"
    >
      {busy ? "Converting…" : "Make Member"}
    </button>
  );
}
