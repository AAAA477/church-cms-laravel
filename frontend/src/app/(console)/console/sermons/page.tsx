import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminSermonSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Sermons" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

const columns: Column<AdminSermonSummary>[] = [
  { key: "title", label: "Title" },
  { key: "link_count", label: "Links" },
];

export default async function SermonsPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const sermons = await adminFetch<{
    data: AdminSermonSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/sermons${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Sermons</h1>
        <Button href="/console/sermons/new">Add Sermon</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by title…" />
        <p className="text-sm text-ink-soft">{sermons.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={sermons.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/sermons/${row.id}`}
          emptyTitle="No sermons found"
          emptyMessage={search ? `No results for "${search}"` : "Add your first sermon to get started."}
        />
      </Card>

      <Pagination
        currentPage={sermons.meta.current_page}
        lastPage={sermons.meta.last_page}
        basePath="/console/sermons"
        searchParams={{ search }}
      />

      {!search && sermons.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/sermons/new" className="text-primary hover:text-primary-dark">
            Add your first sermon →
          </Link>
        </p>
      )}
    </div>
  );
}
