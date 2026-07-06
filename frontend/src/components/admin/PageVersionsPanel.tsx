"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPageVersion } from "@/lib/api-types";

export default function PageVersionsPanel({ pageId, versions }: { pageId: number; versions: AdminPageVersion[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function revert(versionId: number) {
    if (!confirm("Revert to this version? This creates a new version with the old content.")) return;
    setBusy(versionId);
    try {
      const res = await fetch(`/bff/admin/pages/${pageId}/versions/${versionId}/revert`, { method: "POST" });
      if (!res.ok) {
        alert("Could not revert");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (versions.length === 0) {
    return <p className="text-sm text-ink-soft">No version history yet — edit the page to create one.</p>;
  }

  return (
    <div className="border border-warm-deep rounded-sm divide-y divide-warm-deep">
      {versions.map((v) => (
        <div key={v.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm text-ink">Version {v.version_number}</p>
            <p className="text-xs text-ink-soft">
              {v.saved_by} · {new Date(v.created_at).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => revert(v.id)}
            disabled={busy === v.id}
            className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm border border-primary text-primary hover:bg-primary/10 disabled:opacity-60"
          >
            Revert
          </button>
        </div>
      ))}
    </div>
  );
}
