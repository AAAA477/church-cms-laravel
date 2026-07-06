import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DonationStatusSelect from "@/components/admin/DonationStatusSelect";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch } from "@/lib/api";
import type { AdminDonation } from "@/lib/api-types";

export const metadata: Metadata = { title: "Donations" };

type Props = { searchParams: Promise<{ search?: string; page?: string; status?: string }> };

const columns: Column<AdminDonation>[] = [
  {
    key: "name",
    label: "Donor",
    render: (row) => (
      <Link href={`/console/donations/${row.id}`} className="text-ink hover:text-primary">
        {row.name || "Anonymous"}
      </Link>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (row) => `${row.currency} ${Number(row.amount).toLocaleString()}`,
  },
  { key: "category", label: "Category" },
  { key: "method", label: "Method" },
  {
    key: "status",
    label: "Status",
    render: (row) => <DonationStatusSelect donationId={row.id} status={row.status} />,
  },
  {
    key: "actions",
    label: "",
    render: (row) => <DeleteButton endpoint={`/bff/admin/donations/${row.id}`} confirmText="Delete this donation record?" />,
  },
];

export default async function DonationsPage({ searchParams }: Props) {
  const { search, page, status } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (status) params.set("status", status);
  const qs = params.size > 0 ? `?${params}` : "";

  const donations = await adminFetch<{
    data: AdminDonation[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/donations${qs}`);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Donations</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by donor name…" />
        <p className="text-sm text-ink-soft">{donations.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={donations.data}
          getRowId={(row) => row.id}
          emptyTitle="No donations found"
          emptyMessage={search ? `No results for "${search}"` : undefined}
        />
      </Card>

      <Pagination
        currentPage={donations.meta.current_page}
        lastPage={donations.meta.last_page}
        basePath="/console/donations"
        searchParams={{ search, status }}
      />
    </div>
  );
}
