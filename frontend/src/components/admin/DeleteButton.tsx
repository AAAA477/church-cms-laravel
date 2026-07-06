"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({
  endpoint,
  confirmText = "Delete this item? This cannot be undone.",
  redirectTo,
  label = "Delete",
  className,
}: {
  endpoint: string;
  confirmText?: string;
  redirectTo?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        alert("Could not delete. Please try again.");
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
      onClick={handleDelete}
      disabled={busy}
      className={
        className ??
        "text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-sm border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-60"
      }
    >
      {busy ? "Deleting…" : label}
    </button>
  );
}
