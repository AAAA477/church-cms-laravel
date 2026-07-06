import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatusTabs from "@/components/admin/StatusTabs";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminHelp, AdminHelpCounts } from "@/lib/api-types";

export const metadata: Metadata = { title: "Help Requests" };

type Props = {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
};

export default async function HelpsPage({ searchParams }: Props) {
  const { status = "pending", page, search } = await searchParams;

  const params = new URLSearchParams({ status });
  if (page) params.set("page", page);
  if (search) params.set("search", search);

  const result = await adminFetch<{
    counts: AdminHelpCounts;
    data: AdminHelp[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/helps?${params}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Help Requests</h1>

      <StatusTabs
        basePath="/console/helps"
        current={status}
        tabs={[
          { value: "pending", label: "Pending", count: result.counts.pending },
          { value: "approve", label: "Approved", count: result.counts.approve },
          { value: "reject", label: "Rejected", count: result.counts.reject },
          { value: "close", label: "Closed", count: result.counts.close },
        ]}
      />

      <div className="mb-6">
        <SearchBar placeholder="Search by title or description…" />
      </div>

      {result.data.length === 0 ? (
        <EmptyState title="No help requests here" message="Nothing in this status right now." />
      ) : (
        <div className="space-y-3">
          {result.data.map((help) => (
            <Link key={help.id} href={`/console/helps/${help.id}`}>
              <Card className="p-5" hover>
                <p className="text-sm font-medium text-ink">{help.title ?? "Untitled request"}</p>
                <p className="text-sm text-ink-soft line-clamp-2 mt-1">{help.description}</p>
                <p className="text-xs text-ink-soft mt-2">
                  {help.user ?? "Unknown"} · {new Date(help.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={result.meta.current_page}
        lastPage={result.meta.last_page}
        basePath="/console/helps"
        searchParams={{ status, search }}
      />
    </div>
  );
}
