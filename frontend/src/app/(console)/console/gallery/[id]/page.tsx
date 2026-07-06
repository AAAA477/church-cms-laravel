import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import GalleryEditForm from "@/components/admin/GalleryEditForm";
import PhotoGridPanel from "@/components/admin/PhotoGridPanel";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminGalleryDetail, AdminGalleryPhoto } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getGallery(id: string): Promise<AdminGalleryDetail | null> {
  try {
    return await adminFetch<AdminGalleryDetail>(`/gallery/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gallery = await getGallery(id);
  return { title: gallery?.name ?? "Gallery Album" };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const gallery = await getGallery(id);

  if (!gallery) notFound();

  const photos = await adminFetch<AdminGalleryPhoto[]>(`/gallery/${id}/photos`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/gallery" className="text-sm text-primary hover:text-primary-dark">
        ← Gallery
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{gallery.name}</h1>
        <DeleteButton
          endpoint={`/bff/admin/gallery/${gallery.id}`}
          confirmText="Delete this album permanently? This cannot be undone."
          redirectTo="/console/gallery"
        />
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <GalleryEditForm gallery={gallery} />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Photos</h2>
        <PhotoGridPanel uploadEndpoint={`/bff/admin/gallery/${gallery.id}/photos`} photos={photos} />
      </Card>
    </div>
  );
}
