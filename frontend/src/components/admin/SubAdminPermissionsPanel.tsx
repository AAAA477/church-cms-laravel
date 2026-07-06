"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPermissions } from "@/lib/api-types";

export default function SubAdminPermissionsPanel({
  subadminId,
  permissions,
}: {
  subadminId: number;
  permissions: AdminPermissions;
}) {
  const router = useRouter();
  const [assigned, setAssigned] = useState<string[]>(permissions.assigned);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(name: string) {
    setAssigned((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/admin/subadmins/${subadminId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: assigned }),
      });
      if (!res.ok) {
        setError("Could not save permissions");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 max-h-96 overflow-y-auto border border-warm-deep rounded-sm p-4">
        {permissions.all.map((name) => (
          <label key={name} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={assigned.includes(name)} onChange={() => toggle(name)} />
            {name}
          </label>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save Permissions"}
      </button>
    </div>
  );
}
