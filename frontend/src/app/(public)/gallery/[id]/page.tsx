import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { Gallery, Paginated } from "@/lib/api-types";

type Photo = {
  id: number;
  church_id: number;
  gallery_id: number;
  name: string;
  path: string;
};

type Props = { params: Promise<{ id: string }> };

async function getGallery(id: string): Promise<Gallery | undefined> {
  const galleries = await guestGet<Paginated<Gallery>>("/galleries", 600);
  return galleries.data.find((g) => String(g.id) === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gallery = await getGallery(id);
  return { title: gallery?.name ?? "Album" };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const [gallery, photos] = await Promise.all([
    getGallery(id),
    guestGet<Paginated<Photo>>(`/gallery/show/{church}/${id}`, 600),
  ]);

  if (!gallery) notFound();

  return (
    <>
      <header className="hero-gradient texture-overlay">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
            Album
          </p>
          <h1 className="ornament font-display text-4xl sm:text-5xl text-ink">
            {gallery.name}
          </h1>
        </div>
      </header>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {photos.data.length === 0 ? (
            <EmptyState
              title="No photos in this album yet"
              ctaLabel="All Albums"
              ctaHref="/gallery"
            />
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
              {photos.data.map((photo) => (
                <div
                  key={photo.id}
                  className="relative break-inside-avoid rounded-sm overflow-hidden shadow-sm card-hover"
                >
                  <Image
                    src={photo.path}
                    alt={photo.name}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button href="/gallery" variant="outline">
              All Albums
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
