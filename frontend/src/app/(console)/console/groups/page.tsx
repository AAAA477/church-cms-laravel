import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminGroupSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Groups" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

const columns: Column<AdminGroupSummary>[] = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "group_type", label: "Type" },
  { key: "member_count", label: "Members" },
];

export default async function GroupsPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const groups = await adminFetch<{
    data: AdminGroupSummary[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/groups${qs}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Groups</h1>
        <Button href="/console/groups/new">Add Group</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by name, description…" />
        <p className="text-sm text-ink-soft">{groups.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={groups.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/groups/${row.id}`}
          emptyTitle="No groups found"
          emptyMessage={search ? `No results for "${search}"` : "Create your first group to get started."}
        />
      </Card>

      <Pagination
        currentPage={groups.meta.current_page}
        lastPage={groups.meta.last_page}
        basePath="/console/groups"
        searchParams={{ search }}
      />

      {!search && groups.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/groups/new" className="text-primary hover:text-primary-dark">
            Create your first group →
          </Link>
        </p>
      )}
    </div>
  );
}
