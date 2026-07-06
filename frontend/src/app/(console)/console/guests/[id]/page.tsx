import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import GuestEditForm from "@/components/admin/GuestEditForm";
import PersonStatusActions from "@/components/admin/PersonStatusActions";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminGuestDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getGuest(id: string): Promise<AdminGuestDetail | null> {
  try {
    return await adminFetch<AdminGuestDetail>(`/guests/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guest = await getGuest(id);
  return { title: guest ? `${guest.firstname} ${guest.lastname ?? ""}`.trim() : "Guest" };
}

export default async function GuestDetailPage({ params }: Props) {
  const { id } = await params;
  const guest = await getGuest(id);

  if (!guest) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/guests" className="text-sm text-primary hover:text-primary-dark">
        ← Guests
      </Link>

      <div className="flex flex-wrap items-center gap-4 mt-4 mb-8">
        {guest.avatar && (
          <Image
            src={guest.avatar}
            alt={guest.firstname ?? "Guest"}
            width={64}
            height={64}
            className="rounded-full object-cover border-2 border-warm"
          />
        )}
        <div>
          <h1 className="font-display text-3xl text-ink">
            {guest.firstname} {guest.lastname}
          </h1>
          <p className="text-sm text-ink-soft">{guest.email ?? guest.mobile_no}</p>
        </div>
      </div>

      <Card className="p-6 mb-6" hover={false}>
        <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
          Status
        </h2>
        <PersonStatusActions resource="guests" personId={guest.id} currentStatus={guest.status} entityLabel="guest" />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <GuestEditForm guest={guest} />
      </Card>
    </div>
  );
}
