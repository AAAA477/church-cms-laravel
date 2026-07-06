import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import GalleryCard from "@/components/cards/GalleryCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { Gallery, Paginated } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from our services, events and community life.",
};

export default async function GalleryPage() {
  const galleries = await guestGet<Paginated<Gallery>>("/galleries");

  return (
    <>
      <PageHeader
        overline="Moments"
        title="Gallery"
        subtitle="Glimpses of our life together as a community."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {galleries.data.length === 0 ? (
            <EmptyState
              title="No albums yet"
              message="Photos from our gatherings will appear here."
              ctaLabel="Back to Home"
              ctaHref="/"
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {galleries.data.map((gallery) => (
                <GalleryCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
