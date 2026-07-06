import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import SermonCard from "@/components/cards/SermonCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { Sermon } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Sermons",
  description: "Listen to and watch recent sermons.",
};

export default async function SermonsPage() {
  const sermons = await guestGet<{ data: Sermon[] }>("/sermons");

  return (
    <>
      <PageHeader
        overline="The Word"
        title="Sermons"
        subtitle="Messages of faith, hope and encouragement from our services."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sermons.data.length === 0 ? (
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
          )}
        </div>
      </section>
    </>
  );
}
