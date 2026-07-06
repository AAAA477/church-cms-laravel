import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import BulletinCard from "@/components/cards/BulletinCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { Bulletin, Paginated } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Bulletins",
  description: "Weekly and monthly church bulletins.",
};

export default async function BulletinsPage() {
  const bulletins = await guestGet<Paginated<Bulletin>>("/bulletins");

  return (
    <>
      <PageHeader
        overline="Stay Informed"
        title="Bulletins"
        subtitle="Weekly and monthly bulletins with news and announcements."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {bulletins.data.length === 0 ? (
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
          )}
        </div>
      </section>
    </>
  );
}
