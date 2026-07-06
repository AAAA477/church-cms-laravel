import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import PrayerActionsPanel from "@/components/admin/PrayerActionsPanel";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminPrayerDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getPrayer(id: string): Promise<AdminPrayerDetail | null> {
  try {
    return await adminFetch<AdminPrayerDetail>(`/prayer-board/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Prayer Detail" };

export default async function PrayerDetailPage({ params }: Props) {
  const { id } = await params;
  const prayer = await getPrayer(id);

  if (!prayer) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/prayer-board" className="text-sm text-primary hover:text-primary-dark">
        ← Prayer Board
      </Link>

      <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
        <h1 className="font-display text-2xl text-ink">{prayer.category ?? "Uncategorized"}</h1>
        <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-warm text-ink-soft">
          {prayer.status}
        </span>
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <p className="text-ink whitespace-pre-wrap">{prayer.text}</p>
        <p className="text-sm text-ink-soft mt-4">
          Submitted by {prayer.user ?? "Anonymous"} on {new Date(prayer.created_at).toLocaleString()}
        </p>
        {prayer.rejection_reason && (
          <p className="text-sm text-red-700 mt-2">Rejected: {prayer.rejection_reason}</p>
        )}
        {prayer.answer_testimony && (
          <p className="text-sm text-green-700 mt-2">Testimony: {prayer.answer_testimony}</p>
        )}
        {prayer.expires_at && (
          <p className="text-xs text-ink-soft mt-2">
            Expires {new Date(prayer.expires_at).toLocaleDateString()}
          </p>
        )}
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Moderation</h2>
        <PrayerActionsPanel prayer={prayer} />
      </Card>
    </div>
  );
}
