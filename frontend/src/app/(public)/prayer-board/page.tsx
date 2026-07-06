import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import PrayerCard from "@/components/cards/PrayerCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { PrayerRequest } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Prayer Board",
  description: "Lift a prayer for someone — every prayer counts.",
};

export default async function PrayerBoardPage() {
  const prayers = await guestGet<{ data: PrayerRequest[] }>(
    "/prayerRequests",
    60,
  );

  return (
    <>
      <PageHeader
        overline="Intercede"
        title="Prayer Board"
        subtitle="Join us in lifting these requests before God. Tap a prayer to stand with someone today."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {prayers.data.length === 0 ? (
            <EmptyState
              title="No active prayer requests"
              message="Active prayer requests from our community will appear here."
              ctaLabel="Back to Home"
              ctaHref="/"
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {prayers.data.map((prayer) => (
                <PrayerCard key={prayer.id} prayer={prayer} />
              ))}
            </div>
          )}

          <p className="mt-16 text-center text-sm text-ink-soft">
            Want to share a prayer request? Members can submit one from the
            member portal — coming soon.
          </p>
        </div>
      </section>
    </>
  );
}
