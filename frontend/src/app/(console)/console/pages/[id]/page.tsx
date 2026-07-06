import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import PageEditForm from "@/components/admin/PageEditForm";
import PageVersionsPanel from "@/components/admin/PageVersionsPanel";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminPageCategory, AdminPageDetail, AdminPageVersion } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getPage(id: string): Promise<AdminPageDetail | null> {
  try {
    return await adminFetch<AdminPageDetail>(`/pages/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Edit Page" };

export default async function PageDetailPage({ params }: Props) {
  const { id } = await params;
  const page = await getPage(id);

  if (!page) notFound();

  const [categories, versions] = await Promise.all([
    adminFetch<AdminPageCategory[]>("/page-categories"),
    adminFetch<AdminPageVersion[]>(`/pages/${id}/versions`),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/pages" className="text-sm text-primary hover:text-primary-dark">
        ← Pages
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{page.page_name}</h1>
        <DeleteButton
          endpoint={`/bff/admin/pages/${page.id}`}
          confirmText="Delete this page permanently?"
          redirectTo="/console/pages"
        />
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <PageEditForm page={page} categories={categories} />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Version History</h2>
        <PageVersionsPanel pageId={page.id} versions={versions} />
      </Card>
    </div>
  );
}
