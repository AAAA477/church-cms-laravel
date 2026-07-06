"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminAvailableMember, AdminGroupMember } from "@/lib/api-types";

const ROLE_OPTIONS = ["member", "group_admin", "guest"] as const;

export default function GroupMembersPanel({
  groupId,
  members,
}: {
  groupId: number;
  members: AdminGroupMember[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [available, setAvailable] = useState<AdminAvailableMember[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]>("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchAvailable(query: string) {
    setSearch(query);
    const res = await fetch(`/bff/admin/groups/${groupId}/available-members?search=${encodeURIComponent(query)}`);
    if (res.ok) {
      setAvailable(await res.json());
    }
  }

  function toggleSelected(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function addSelected() {
    if (selected.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/admin/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: selected, role }),
      });
      if (!res.ok) {
        setError("Could not add members");
        return;
      }
      setSelected([]);
      setAvailable([]);
      setSearch("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateRole(linkId: number, newRole: string) {
    setBusy(true);
    try {
      await fetch(`/bff/admin/groups/${groupId}/members/${linkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(linkId: number) {
    if (!confirm("Remove this member from the group?")) return;
    setBusy(true);
    try {
      await fetch(`/bff/admin/groups/${groupId}/members/${linkId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-2">Add Members</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => searchAvailable(e.target.value)}
            placeholder="Search members…"
            className="flex-1 min-w-[200px] rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof ROLE_OPTIONS)[number])}
            className="rounded-sm border border-warm-deep bg-white px-3 py-2 text-sm text-ink"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addSelected}
            disabled={busy || selected.length === 0}
            className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-sm bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
          >
            Add ({selected.length})
          </button>
        </div>
        {available.length > 0 && (
          <div className="border border-warm-deep rounded-sm divide-y divide-warm-deep max-h-48 overflow-y-auto">
            {available.map((u) => (
              <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm text-ink cursor-pointer hover:bg-warm/50">
                <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelected(u.id)} />
                {u.name}
              </label>
            ))}
          </div>
        )}
        {error && (
          <p className="text-sm text-red-700 mt-2" role="alert">
            {error}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-2">
          Current Members ({members.length})
        </h3>
        {members.length === 0 ? (
          <p className="text-sm text-ink-soft">No members yet.</p>
        ) : (
          <div className="border border-warm-deep rounded-sm divide-y divide-warm-deep">
            {members.map((m) => (
              <div key={m.link_id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <div>
                  <p className="text-sm text-ink">{m.name}</p>
                  {m.email && <p className="text-xs text-ink-soft">{m.email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={m.role ?? "member"}
                    onChange={(e) => updateRole(m.link_id, e.target.value)}
                    disabled={busy}
                    className="rounded-sm border border-warm-deep bg-white px-2 py-1 text-xs text-ink"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeMember(m.link_id)}
                    disabled={busy}
                    className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-sm border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
