"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The nav dropdown's "Admin Console" entry. Always mints a fresh
 * admin_token cookie before navigating (POST /bff/auth/upgrade-admin) —
 * cheap and idempotent — so it works on the very first click even if this
 * session predates the account being promoted to admin/subadmin. See
 * (public)/layout.tsx's getNavMember for why isAdmin no longer implies an
 * admin_token cookie already exists.
 */
export default function AdminConsoleLink({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const res = await fetch("/bff/auth/upgrade-admin", { method: "POST" });
      onNavigate?.();
      if (res.ok) {
        router.push("/console");
      } else {
        // Role check failed server-side (e.g. account was demoted since
        // page load) — send them to the console login rather than a dead
        // link with no explanation.
        router.push("/console/login");
      }
    } catch {
      router.push("/console/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={busy} className={className}>
      {busy ? "Opening…" : "Admin Console →"}
    </button>
  );
}
