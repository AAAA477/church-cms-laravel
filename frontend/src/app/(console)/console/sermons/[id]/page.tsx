import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import SermonEditForm from "@/components/admin/SermonEditForm";
import SermonLinksPanel from "@/components/admin/SermonLinksPanel";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminSermonDetail, AdminSermonLink } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getSermon(id: string): Promise<AdminSermonDetail | null> {
  try {
    return await adminFetch<AdminSermonDetail>(`/sermons/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermon(id);
  return { title: sermon?.title ?? "Sermon" };
}

export default async function SermonDetailPage({ params }: Props) {
  const { id } = await params;
  const sermon = await getSermon(id);

  if (!sermon) notFound();

  const links = await adminFetch<AdminSermonLink[]>(`/sermons/${id}/links`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/sermons" className="text-sm text-primary hover:text-primary-dark">
        ← Sermons
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{sermon.title}</h1>
        <DeleteButton
          endpoint={`/bff/admin/sermons/${sermon.id}`}
          confirmText="Delete this sermon permanently? This cannot be undone."
          redirectTo="/console/sermons"
        />
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <SermonEditForm sermon={sermon} />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Sermon Links</h2>
        <SermonLinksPanel sermonId={sermon.id} links={links} />
      </Card>
    </div>
  );
}
