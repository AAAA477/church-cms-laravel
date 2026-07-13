"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "member" | "subadmin" | "admin";

const LABELS: Record<Role, string> = {
  admin: "Make Admin",
  subadmin: "Make Subadmin",
  member: "Revert to Member",
};

const CONFIRMS: Record<Role, string> = {
  admin: "full admin (complete access to this console, including roles)",
  subadmin: "subadmin (console access for day-to-day management)",
  member: "regular member (no console access)",
};

/**
 * Role controls shown to full admins on the member and staff detail pages.
 * POSTs to /api/admin/members/{id}/role, which enforces the real rules
 * server-side (full-admin actor, no self-change, never demote the last
 * admin, guests must become members first).
 */
export default function RoleButtons({
  userId,
  name,
  currentRole,
  redirectTo,
}: {
  userId: number;
  name?: string;
  currentRole: Role;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(role: Role) {
    if (!confirm(`Make ${name ?? "this user"} a ${CONFIRMS[role]}?`)) return;
    setBusy(role);
    setError(null);
    try {
      const res = await fetch(`/bff/admin/members/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        setError(body.message ?? "Could not change the role.");
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        // Staying on the same detail page: router.refresh() has been
        // observed to keep serving the stale RSC payload here (this Next
        // version's router cache doesn't always invalidate a same-URL
        // refresh reached via client-side Link navigation, even though
        // the mutation itself succeeded) — a hard reload guarantees the
        // new role actually renders.
        window.location.reload();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  const targets = (["admin", "subadmin", "member"] as Role[]).filter((r) => r !== currentRole);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {targets.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => changeRole(role)}
            disabled={busy !== null}
            className={
              "text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border disabled:opacity-60 whitespace-nowrap " +
              (role === "member"
                ? "border-red-600 text-red-700 hover:bg-red-50"
                : "border-primary text-primary hover:bg-warm")
            }
          >
            {busy === role ? "Changing…" : LABELS[role]}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
