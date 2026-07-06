import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import PageHeader from "@/components/site/PageHeader";
import PrayerCard from "@/components/cards/PrayerCard";
import PrayerRequestForm from "@/components/site/PrayerRequestForm";
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
  const isSignedIn = Boolean((await cookies()).get("member_token")?.value);
  const categories = isSignedIn
    ? await guestGet<{ id: number; name: string }[]>("/prayerCategories", 300).catch(() => [])
    : [];

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

          <div className="mt-16 max-w-xl mx-auto">
            {isSignedIn ? (
              <PrayerRequestForm categories={categories} />
            ) : (
              <div className="rounded-sm bg-warm px-8 py-10 text-center">
                <h3 className="font-display text-2xl text-ink mb-2">
                  Want to share a prayer request?
                </h3>
                <p className="text-ink-soft mb-6">
                  Sign in to submit a request for our community to pray over.
                </p>
                <Link
                  href="/member/login?next=/prayer-board"
                  className="inline-block bg-primary text-white text-sm font-medium uppercase tracking-wider px-6 py-2.5 rounded-sm hover:bg-primary-dark transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
