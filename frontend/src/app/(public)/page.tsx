import Image from "next/image";
import AboutCarousel from "@/components/site/AboutCarousel";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { guestGet } from "@/lib/api";
import type { ChurchDetails, Event, Sermon } from "@/lib/api-types";

export default async function HomePage() {
  const [church, events, sermons] = await Promise.all([
    guestGet<ChurchDetails>("/church/details", 600),
    guestGet<{ data: Event[] }>("/events"),
    guestGet<{ data: Sermon[] }>("/sermons"),
  ]);

  const upcomingEvents = events.data.slice(0, 3);
  const recentSermons = sermons.data.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient texture-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
          <p className="animate-fade-in-up text-sm font-medium uppercase tracking-[0.3em] text-primary mb-6">
            Welcome Home
          </p>
          <h1 className="animate-fade-in-up delay-100 font-display text-5xl sm:text-6xl lg:text-7xl text-ink leading-tight">
            {church.church_name}
          </h1>
          {church.short_summary && (
            <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-lg text-ink-soft leading-relaxed">
              {church.short_summary}
            </p>
          )}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/events">Join Us</Button>
            <Button href="/resources" variant="outline">
              Watch Sermons
            </Button>
          </div>
        </div>
      </section>

      {/* Quote strip */}
      {church.quotes && (
        <section className="bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <p className="font-display text-2xl sm:text-3xl italic leading-relaxed">
              “{church.quotes}”
            </p>
          </div>
        </section>
      )}

      {/* About Us — admin-managed carousel (Settings > About). Replaces the
          old About pages entry point; falls back to long_summary text. */}
      {/* Optional chaining: a cached pre-upgrade response may lack the field. */}
      {((church.about_carousel?.length ?? 0) > 0 || church.long_summary) && (
        <section id="about" className="py-24 bg-warm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="ornament font-display text-4xl text-ink">
                About Us
              </h2>
            </div>
            {(church.about_carousel?.length ?? 0) > 0 ? (
              <AboutCarousel slides={church.about_carousel} />
            ) : (
              <p className="max-w-3xl mx-auto text-center text-ink-soft leading-relaxed whitespace-pre-line">
                {church.long_summary}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Upcoming events */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="ornament font-display text-4xl text-ink">
              Upcoming Events
            </h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-center text-ink-soft">
              No upcoming events — check back soon.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  {event.image && (
                    <div className="relative h-48">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
                      {event.start_date}
                    </p>
                    <h3 className="font-display text-2xl text-ink mb-2">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="text-sm text-ink-soft">{event.location}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button href="/events" variant="outline">
              All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Recent sermons */}
      <section className="py-24 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="ornament font-display text-4xl text-ink">
              Recent Sermons
            </h2>
          </div>

          {recentSermons.length === 0 ? (
            <p className="text-center text-ink-soft">No sermons yet.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recentSermons.map((sermon) => (
                <Card key={sermon.sermon_id}>
                  {sermon.cover_image && (
                    <div className="relative h-48">
                      <Image
                        src={sermon.cover_image}
                        alt={sermon.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
                      {sermon.author}
                    </p>
                    <h3 className="font-display text-2xl text-ink mb-2">
                      {sermon.title}
                    </h3>
                    <p className="text-sm text-ink-soft line-clamp-2">
                      {sermon.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button href="/resources" variant="outline">
              All Sermons
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
