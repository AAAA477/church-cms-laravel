import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminPost } from "@/lib/api-types";

export const metadata: Metadata = { title: "Posts" };

type Props = { searchParams: Promise<{ search?: string; page?: string; status?: string }> };

const columns: Column<AdminPost>[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-warm text-ink-soft">
        {row.status}
      </span>
    ),
  },
];

export default async function PostsPage({ searchParams }: Props) {
  const { search, page, status } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (status) params.set("status", status);
  const qs = params.size > 0 ? `?${params}` : "";

  const posts = await adminFetch<{
    data: AdminPost[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/posts${qs}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Posts</h1>
        <div className="flex gap-3">
          <Link href="/console/posts/categories" className="text-sm text-primary hover:text-primary-dark self-center">
            Manage Categories
          </Link>
          <Button href="/console/posts/new">Add Post</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by title…" />
        <p className="text-sm text-ink-soft">{posts.meta.total} total</p>
      </div>

      <Card className="p-2" hover={false}>
        <DataTable
          columns={columns}
          rows={posts.data}
          getRowId={(row) => row.id}
          rowHref={(row) => `/console/posts/${row.id}`}
          emptyTitle="No posts found"
          emptyMessage={search ? `No results for "${search}"` : "Publish your first post to get started."}
        />
      </Card>

      <Pagination
        currentPage={posts.meta.current_page}
        lastPage={posts.meta.last_page}
        basePath="/console/posts"
        searchParams={{ search, status }}
      />
    </div>
  );
}
