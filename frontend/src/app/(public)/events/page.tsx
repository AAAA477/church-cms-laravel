import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import EventCard from "@/components/cards/EventCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import { isUpcoming } from "@/lib/format";
import type { Event } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming services, gatherings and community events.",
};

export default async function EventsPage() {
  const events = await guestGet<{ data: Event[] }>("/events");

  const upcoming = events.data.filter((e) => isUpcoming(e.start_date));
  const past = events.data.filter((e) => !isUpcoming(e.start_date));

  return (
    <>
      <PageHeader
        overline="Gather With Us"
        title="Events"
        subtitle="Services, gatherings and everything happening in our community."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.data.length === 0 ? (
            <EmptyState
              title="No events scheduled"
              message="Check back soon for upcoming gatherings."
              ctaLabel="Back to Home"
              ctaHref="/"
            />
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-20">
                  <h2 className="font-display text-3xl text-ink mb-10">
                    Upcoming
                  </h2>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 className="font-display text-3xl text-ink mb-10">
                    Past Events
                  </h2>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 opacity-80">
                    {past.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
