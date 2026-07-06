import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminActivityLogEntry } from "@/lib/api-types";

export const metadata: Metadata = { title: "Activity Log" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ActivityLogPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const qs = page ? `?page=${page}` : "";

  const result = await adminFetch<{
    data: AdminActivityLogEntry[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/activity-log${qs}`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Activity Log</h1>

      {result.data.length === 0 ? (
        <EmptyState title="No activity yet" message="Actions you take in the console will show up here." />
      ) : (
        <Card className="p-2" hover={false}>
          <div className="divide-y divide-warm-deep">
            {result.data.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <p className="text-sm text-ink">{entry.description}</p>
                <p className="text-xs text-ink-soft shrink-0">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Pagination
        currentPage={result.meta.current_page}
        lastPage={result.meta.last_page}
        basePath="/console/activity-log"
        searchParams={{}}
      />
    </div>
  );
}
