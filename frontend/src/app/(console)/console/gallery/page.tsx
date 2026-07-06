import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminGallerySummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Gallery" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

const columns: Column<AdminGallerySummary>[] = [
  { key: "name", label: "Album" },
  { key: "photo_count", label: "Photos" },
];

export default async function GalleryPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const galleries = await adminFetch<{
    data: AdminGallerySummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/gallery${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Gallery</h1>
        <Button href="/console/gallery/new">Add Album</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by album name…" />
        <p className="text-sm text-ink-soft">{galleries.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={galleries.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/gallery/${row.id}`}
          emptyTitle="No albums found"
          emptyMessage={search ? `No results for "${search}"` : "Create your first album to get started."}
        />
      </Card>

      <Pagination
        currentPage={galleries.meta.current_page}
        lastPage={galleries.meta.last_page}
        basePath="/console/gallery"
        searchParams={{ search }}
      />

      {!search && galleries.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/gallery/new" className="text-primary hover:text-primary-dark">
            Create your first album →
          </Link>
        </p>
      )}
    </div>
  );
}
