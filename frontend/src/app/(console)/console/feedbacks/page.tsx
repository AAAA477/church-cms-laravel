import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminFeedbackSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Feedbacks" };

type Props = { searchParams: Promise<{ page?: string }> };

const columns: Column<AdminFeedbackSummary>[] = [
  { key: "user", label: "From" },
  { key: "message_count", label: "Messages" },
  {
    key: "created_at",
    label: "Received",
    render: (row) => new Date(row.created_at).toLocaleDateString(),
  },
];

export default async function FeedbacksPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const qs = page ? `?page=${page}` : "";

  const feedbacks = await adminFetch<{
    data: AdminFeedbackSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/feedbacks${qs}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Feedbacks</h1>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={feedbacks.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/feedbacks/${row.id}`}
          emptyTitle="No feedback yet"
        />
      </Card>

      <Pagination
        currentPage={feedbacks.meta.current_page}
        lastPage={feedbacks.meta.last_page}
        basePath="/console/feedbacks"
        searchParams={{}}
      />
    </div>
  );
}
