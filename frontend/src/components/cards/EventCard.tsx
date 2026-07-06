import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Event } from "@/lib/api-types";

/** "30 Jun 2026 09:00:00" → { day: "30", month: "Jun" } */
function dateBlock(startDate: string) {
  const [day, month] = startDate.split(" ");
  return { day, month };
}

export default function EventCard({ event }: { event: Event }) {
  const { day, month } = dateBlock(event.start_date);

  return (
    <Card>
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative h-48 bg-warm">
          {event.image && (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          )}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-sm px-3 py-2 text-center shadow-sm">
            <span className="block font-display text-2xl leading-none text-primary">
              {day}
            </span>
            <span className="block text-xs uppercase tracking-wide text-ink-soft mt-1">
              {month}
            </span>
          </div>
        </div>
        <div className="p-6">
          {event.category && (
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
              {event.category}
            </p>
          )}
          <h3 className="font-display text-2xl text-ink mb-2">{event.title}</h3>
          {event.location && (
            <p className="text-sm text-ink-soft">{event.location}</p>
          )}
        </div>
      </Link>
    </Card>
  );
}
