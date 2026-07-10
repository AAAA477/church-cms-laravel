import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import ResourceTabs from "@/components/site/ResourceTabs";
import SermonCard from "@/components/cards/SermonCard";
import BulletinCard from "@/components/cards/BulletinCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { Bulletin, Paginated, Sermon } from "@/lib/api-types";

// Sermons and bulletins were merged into one Resources destination
// (2026-07-09); the old /sermons and /bulletins list URLs redirect here
// (next.config.ts) while sermon detail pages keep /sermons/:id.
export const metadata: Metadata = {
  title: "Resources",
  description:
    "Church resources — sermons to watch and listen to, plus weekly and monthly bulletins.",
};

export default async function ResourcesPage() {
  const [sermons, bulletins] = await Promise.all([
    guestGet<{ data: Sermon[] }>("/sermons"),
    guestGet<Paginated<Bulletin>>("/bulletins"),
  ]);

  return (
    <>
      <PageHeader
        overline="Grow With Us"
        title="Resources"
        subtitle="Messages from our services, and bulletins with news and announcements."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ResourceTabs
            sermonsPanel={
              sermons.data.length === 0 ? (
                <EmptyState
                  title="No sermons yet"
                  message="New messages will appear here soon."
                  ctaLabel="Back to Home"
                  ctaHref="/"
                />
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {sermons.data.map((sermon) => (
                    <SermonCard key={sermon.sermon_id} sermon={sermon} />
                  ))}
                </div>
              )
            }
            bulletinsPanel={
              bulletins.data.length === 0 ? (
                <EmptyState
                  title="No bulletins yet"
                  message="New bulletins will be published here."
                  ctaLabel="Back to Home"
                  ctaHref="/"
                />
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {bulletins.data.map((bulletin) => (
                    <BulletinCard key={bulletin.id} bulletin={bulletin} />
                  ))}
                </div>
              )
            }
          />
        </div>
      </section>
    </>
  );
}
