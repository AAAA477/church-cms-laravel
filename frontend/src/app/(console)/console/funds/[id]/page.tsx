import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import FundStatusForm from "@/components/admin/FundStatusForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminFundDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getFund(id: string): Promise<AdminFundDetail | null> {
  try {
    return await adminFetch<AdminFundDetail>(`/funds/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Contribution Detail" };

export default async function FundDetailPage({ params }: Props) {
  const { id } = await params;
  const fund = await getFund(id);

  if (!fund) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/funds" className="text-sm text-primary hover:text-primary-dark">
        ← Funds
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{fund.name}</h1>
        <DeleteButton
          endpoint={`/bff/admin/funds/${fund.id}`}
          confirmText="Delete this contribution record permanently?"
          redirectTo="/console/funds"
        />
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Amount</dt>
            <dd className="text-ink">${Number(fund.amount).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Method</dt>
            <dd className="text-ink capitalize">{fund.method}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Contributor Type</dt>
            <dd className="text-ink capitalize">{fund.membership}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Recorded</dt>
            <dd className="text-ink">{new Date(fund.created_at).toLocaleString()}</dd>
          </div>
        </dl>
        {fund.payment_details && (
          <div className="mt-4 pt-4 border-t border-warm-deep">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-2">Payment Details</p>
            <dl className="grid gap-2 sm:grid-cols-2 text-sm">
              {Object.entries(fund.payment_details).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-ink-soft capitalize">{key.replace(/_/g, " ")}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Contribution</h2>
        <FundStatusForm fund={fund} />
      </Card>
    </div>
  );
}
