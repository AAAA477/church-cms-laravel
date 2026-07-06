import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminEventSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Events" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string; filter?: string }>;
};

const columns: Column<AdminEventSummary>[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "location", label: "Location" },
  {
    key: "start_date",
    label: "Start",
    render: (row) => new Date(row.start_date).toLocaleString(),
  },
];

export default async function EventsPage({ searchParams }: Props) {
  const { search, page, filter } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (filter) params.set("filter", filter);
  const qs = params.size > 0 ? `?${params}` : "";

  const events = await adminFetch<{
    data: AdminEventSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/events${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Events</h1>
        <Button href="/console/events/new">Add Event</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by title…" />
        <p className="text-sm text-ink-soft">{events.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={events.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/events/${row.id}`}
          emptyTitle="No events found"
          emptyMessage={search ? `No results for "${search}"` : "Create your first event to get started."}
        />
      </Card>

      <Pagination
        currentPage={events.meta.current_page}
        lastPage={events.meta.last_page}
        basePath="/console/events"
        searchParams={{ search, filter }}
      />

      {!search && events.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/events/new" className="text-primary hover:text-primary-dark">
            Create your first event →
          </Link>
        </p>
      )}
    </div>
  );
}
