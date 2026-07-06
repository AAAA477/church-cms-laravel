import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch } from "@/lib/api";
import type { AdminBulletin } from "@/lib/api-types";

export const metadata: Metadata = { title: "Bulletins" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string; type?: string }>;
};

const columns: Column<AdminBulletin>[] = [
  { key: "name", label: "Name" },
  {
    key: "period",
    label: "Period",
    render: (row) => (row.type === "week" ? `Week ${row.week}, ${row.year}` : `Month ${row.month}, ${row.year}`),
  },
  {
    key: "path",
    label: "File",
    render: (row) =>
      row.path ? (
        <a href={row.path} target="_blank" rel="noreferrer" className="text-primary hover:text-primary-dark">
          Download
        </a>
      ) : (
        "—"
      ),
  },
  {
    key: "actions",
    label: "",
    render: (row) => (
      <DeleteButton endpoint={`/bff/admin/bulletins/${row.id}`} confirmText="Delete this bulletin?" />
    ),
  },
];

export default async function BulletinsPage({ searchParams }: Props) {
  const { search, page, type } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (type) params.set("type", type);
  const qs = params.size > 0 ? `?${params}` : "";

  const bulletins = await adminFetch<{
    data: AdminBulletin[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/bulletins${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Bulletins</h1>
        <Button href="/console/bulletins/new">Upload Bulletin</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by name…" />
        <p className="text-sm text-ink-soft">{bulletins.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={bulletins.data}
          getRowId={(row) => row.id}
          emptyTitle="No bulletins found"
          emptyMessage={search ? `No results for "${search}"` : "Upload your first bulletin to get started."}
        />
      </Card>

      <Pagination
        currentPage={bulletins.meta.current_page}
        lastPage={bulletins.meta.last_page}
        basePath="/console/bulletins"
        searchParams={{ search, type }}
      />

      {!search && bulletins.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/bulletins/new" className="text-primary hover:text-primary-dark">
            Upload your first bulletin →
          </Link>
        </p>
      )}
    </div>
  );
}
