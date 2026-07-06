import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatusTabs from "@/components/admin/StatusTabs";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminPrayerCounts, AdminPrayerSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Prayer Board" };

type Props = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function PrayerBoardPage({ searchParams }: Props) {
  const { status = "pending", page } = await searchParams;

  const params = new URLSearchParams({ status });
  if (page) params.set("page", page);

  const result = await adminFetch<{
    counts: AdminPrayerCounts;
    data: AdminPrayerSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/prayer-board?${params}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Prayer Board</h1>
        <Link href="/console/prayer-board/categories" className="text-sm text-primary hover:text-primary-dark">
          Manage Categories →
        </Link>
      </div>

      <StatusTabs
        basePath="/console/prayer-board"
        current={status}
        tabs={[
          { value: "pending", label: "Pending", count: result.counts.pending },
          { value: "active", label: "Active", count: result.counts.active },
          { value: "answered", label: "Answered", count: result.counts.answered },
          { value: "ended", label: "Ended", count: result.counts.ended },
          { value: "rejected", label: "Rejected", count: result.counts.rejected },
        ]}
      />

      {result.data.length === 0 ? (
        <EmptyState title="No prayers here" message="Nothing in this status right now." />
      ) : (
        <div className="space-y-3">
          {result.data.map((prayer) => (
            <Link key={prayer.id} href={`/console/prayer-board/${prayer.id}`}>
              <Card className="p-5" hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-ink line-clamp-2">{prayer.text}</p>
                    <p className="text-xs text-ink-soft mt-1">
                      {prayer.user ?? "Anonymous"} · {prayer.category ?? "Uncategorized"} ·{" "}
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {prayer.pinned && (
                    <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-primary-dark shrink-0">
                      Pinned
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={result.meta.current_page}
        lastPage={result.meta.last_page}
        basePath="/console/prayer-board"
        searchParams={{ status }}
      />
    </div>
  );
}
