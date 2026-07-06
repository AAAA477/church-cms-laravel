import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminPageSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Pages" };

type Props = { searchParams: Promise<{ search?: string; page?: string }> };

const columns: Column<AdminPageSummary>[] = [
  { key: "page_name", label: "Page" },
  { key: "category", label: "Category" },
];

export default async function PagesPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const pages = await adminFetch<{
    data: AdminPageSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/pages${qs}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Pages</h1>
        <div className="flex gap-3">
          <Link href="/console/pages/categories" className="text-sm text-primary hover:text-primary-dark self-center">
            Manage Categories
          </Link>
          <Link
            href="/console/pages/new"
            className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-6 py-2.5 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark"
          >
            Add Page
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by page name…" />
        <p className="text-sm text-ink-soft">{pages.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={pages.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/pages/${row.id}`}
          emptyTitle="No pages found"
          emptyMessage={search ? `No results for "${search}"` : "Create your first page to get started."}
        />
      </Card>

      <Pagination
        currentPage={pages.meta.current_page}
        lastPage={pages.meta.last_page}
        basePath="/console/pages"
        searchParams={{ search }}
      />
    </div>
  );
}
