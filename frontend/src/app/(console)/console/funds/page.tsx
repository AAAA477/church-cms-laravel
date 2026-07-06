import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminFundSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Funds" };

type Props = { searchParams: Promise<{ search?: string; page?: string; status?: string }> };

const columns: Column<AdminFundSummary>[] = [
  { key: "name", label: "Contributor" },
  {
    key: "amount",
    label: "Amount",
    render: (row) => Number(row.amount).toLocaleString(undefined, { style: "currency", currency: "USD" }),
  },
  { key: "method", label: "Method" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={
          row.status === "deposited"
            ? "text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium uppercase"
            : row.status === "cancel"
              ? "text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium uppercase"
              : "text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium uppercase"
        }
      >
        {row.status}
      </span>
    ),
  },
];

export default async function FundsPage({ searchParams }: Props) {
  const { search, page, status } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (status) params.set("status", status);
  const qs = params.size > 0 ? `?${params}` : "";

  const funds = await adminFetch<{
    data: AdminFundSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/funds${qs}`);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Funds</h1>
        <Button href="/console/funds/new">Record Contribution</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by contributor name…" />
        <p className="text-sm text-ink-soft">{funds.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={funds.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/funds/${row.id}`}
          emptyTitle="No contributions found"
          emptyMessage={search ? `No results for "${search}"` : "Record your first contribution to get started."}
        />
      </Card>

      <Pagination
        currentPage={funds.meta.current_page}
        lastPage={funds.meta.last_page}
        basePath="/console/funds"
        searchParams={{ search, status }}
      />
    </div>
  );
}
