import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminContact } from "@/lib/api-types";

export const metadata: Metadata = { title: "Contact Requests" };

type Props = { searchParams: Promise<{ search?: string; page?: string }> };

const columns: Column<AdminContact>[] = [
  { key: "fullname", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  {
    key: "date_of_submission",
    label: "Submitted",
    render: (row) => new Date(row.date_of_submission).toLocaleDateString(),
  },
];

export default async function ContactsPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const contacts = await adminFetch<{
    data: AdminContact[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/contacts${qs}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Contact Requests</h1>

      <div className="mb-6">
        <SearchBar placeholder="Search by name, email, mobile…" />
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={contacts.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/contacts/${row.id}`}
          emptyTitle="No contact requests found"
          emptyMessage={search ? `No results for "${search}"` : undefined}
        />
      </Card>

      <Pagination
        currentPage={contacts.meta.current_page}
        lastPage={contacts.meta.last_page}
        basePath="/console/contacts"
        searchParams={{ search }}
      />
    </div>
  );
}
