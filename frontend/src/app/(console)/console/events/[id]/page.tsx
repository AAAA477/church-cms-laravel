import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import EventEditForm from "@/components/admin/EventEditForm";
import PhotoGridPanel from "@/components/admin/PhotoGridPanel";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminEventDetail, AdminEventPhoto } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getEvent(id: string): Promise<AdminEventDetail | null> {
  try {
    return await adminFetch<AdminEventDetail>(`/events/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
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

  const photos = await adminFetch<AdminEventPhoto[]>(`/events/${id}/photos`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/events" className="text-sm text-primary hover:text-primary-dark">
        ← Events
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{event.title}</h1>
        <DeleteButton
          endpoint={`/bff/admin/events/${event.id}`}
          confirmText="Delete this event permanently? This cannot be undone."
          redirectTo="/console/events"
        />
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <EventEditForm event={event} />
      </Card>

      {event.enable_gallery && (
        <Card className="p-8" hover={false}>
          <h2 className="font-display text-2xl text-ink mb-6">Photos</h2>
          <PhotoGridPanel uploadEndpoint={`/bff/admin/events/${event.id}/photos`} photos={photos} />
        </Card>
      )}
    </div>
  );
}
