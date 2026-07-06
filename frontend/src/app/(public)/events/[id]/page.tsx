import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Button from "@/components/ui/Button";
import { guestGet, ApiError } from "@/lib/api";
import type { Event } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getEvent(id: string): Promise<Event | null> {
  try {
    return await guestGet<Event>(`/event/show/{church}/${id}`, 600);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 500)) {
      return null;
    }
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  return { title: event?.title ?? "Event" };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  return (
    <article>
      <header className="hero-gradient texture-overlay">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Events", href: "/events" },
              { label: event.title },
            ]}
          />
          {event.category && (
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
              {event.category}
            </p>
          )}
          <div className="mx-auto mb-6 h-[3px] w-[60px] bg-primary" aria-hidden />
          <h1 className="font-display text-4xl sm:text-5xl text-ink">
            {event.title}
          </h1>
          <p className="mt-4 text-sm text-ink-soft">
            {event.start_date}
            {event.end_date && ` — ${event.end_date}`}
          </p>
          {event.location && (
            <p className="mt-2 text-sm text-ink-soft">{event.location}</p>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {event.image && (
          <div className="relative h-72 sm:h-96 mb-12 rounded-sm overflow-hidden shadow-sm">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              preload
            />
          </div>
        )}

        <div className="text-ink-soft leading-relaxed whitespace-pre-line">
          {event.description}
        </div>

        <div className="mt-16 text-center">
          <Button href="/events" variant="outline">
            All Events
          </Button>
        </div>
      </div>
    </article>
  );
}
