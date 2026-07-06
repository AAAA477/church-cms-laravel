import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminSubAdminSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Sub-Admins" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

const columns: Column<AdminSubAdminSummary>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile_no", label: "Mobile" },
];

export default async function SubAdminsPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const subadmins = await adminFetch<{
    data: AdminSubAdminSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/subadmins${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Sub-Admins</h1>
        <Button href="/console/subadmins/new">Add Sub-Admin</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by name, email, mobile…" />
        <p className="text-sm text-ink-soft">{subadmins.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={subadmins.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/subadmins/${row.id}`}
          emptyTitle="No sub-admins found"
          emptyMessage={search ? `No results for "${search}"` : "Add your first sub-admin to get started."}
        />
      </Card>

      <Pagination
        currentPage={subadmins.meta.current_page}
        lastPage={subadmins.meta.last_page}
        basePath="/console/subadmins"
        searchParams={{ search }}
      />

      {!search && subadmins.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/subadmins/new" className="text-primary hover:text-primary-dark">
            Add your first sub-admin →
          </Link>
        </p>
      )}
    </div>
  );
}
