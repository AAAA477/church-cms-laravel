import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminMemberSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Members" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string; status?: string }>;
};

const columns: Column<AdminMemberSummary>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile_no", label: "Mobile" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={
          row.status === "active"
            ? "text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium uppercase"
            : "text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium uppercase"
        }
      >
        {row.status ?? "—"}
      </span>
    ),
  },
  { key: "city", label: "City" },
];

export default async function MembersPage({ searchParams }: Props) {
  const { search, page, status } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (status) params.set("status", status);
  const qs = params.size > 0 ? `?${params}` : "";

  const members = await adminFetch<{
    data: AdminMemberSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/members${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Members</h1>
        <Button href="/console/members/new">Add Member</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by name, email, mobile…" />
        <p className="text-sm text-ink-soft">{members.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={members.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/members/${row.id}`}
          emptyTitle="No members found"
          emptyMessage={search ? `No results for "${search}"` : "Add your first member to get started."}
        />
      </Card>

      <Pagination
        currentPage={members.meta.current_page}
        lastPage={members.meta.last_page}
        basePath="/console/members"
        searchParams={{ search, status }}
      />

      {!search && !status && members.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/members/new" className="text-primary hover:text-primary-dark">
            Add your first member →
          </Link>
        </p>
      )}
    </div>
  );
}
