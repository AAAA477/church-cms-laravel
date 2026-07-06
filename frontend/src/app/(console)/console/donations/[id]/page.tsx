import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import DonationStatusSelect from "@/components/admin/DonationStatusSelect";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminDonation } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getDonation(id: string): Promise<AdminDonation | null> {
  try {
    return await adminFetch<AdminDonation>(`/donations/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Donation Detail" };

export default async function DonationDetailPage({ params }: Props) {
  const { id } = await params;
  const donation = await getDonation(id);

  if (!donation) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/donations" className="text-sm text-primary hover:text-primary-dark">
        ← Donations
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{donation.name || "Anonymous"}</h1>
        <DeleteButton
          endpoint={`/bff/admin/donations/${donation.id}`}
          confirmText="Delete this donation record?"
          redirectTo="/console/donations"
        />
      </div>

      <Card className="p-8" hover={false}>
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Amount</dt>
            <dd className="text-ink">
              {donation.currency} {Number(donation.amount).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Method</dt>
            <dd className="text-ink capitalize">{donation.method}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Category</dt>
            <dd className="text-ink">{donation.category ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Donated</dt>
            <dd className="text-ink">{new Date(donation.donated_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Email</dt>
            <dd className="text-ink">{donation.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Status</dt>
            <dd>
              <DonationStatusSelect donationId={donation.id} status={donation.status} />
            </dd>
          </div>
          {donation.note && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Note</dt>
              <dd className="text-ink whitespace-pre-wrap">{donation.note}</dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}
