import type { Donation } from "@/lib/api-types";

function statusColor(status: Donation["status"]) {
  if (status === "completed") return "text-green-700 bg-green-50";
  if (status === "cancelled") return "text-red-700 bg-red-50";
  return "text-amber-700 bg-amber-50";
}

export default function GivingHistory({ donations }: { donations: Donation[] }) {
  if (donations.length === 0) {
    return <p className="text-sm text-ink-soft">No gifts recorded yet.</p>;
  }

  return (
    <ul className="divide-y divide-warm-deep">
      {donations.map((d) => (
        <li key={d.id} className="py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-ink font-medium">
              {d.currency} {d.amount}
              <span className="text-ink-soft font-normal"> · {d.category}</span>
            </p>
            <p className="text-xs text-ink-soft mt-0.5">
              {d.method} · {new Date(d.donated_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`text-xs font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${statusColor(d.status)}`}
          >
            {d.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
