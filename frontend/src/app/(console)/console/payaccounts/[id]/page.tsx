import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import PayaccountEditForm from "@/components/admin/PayaccountEditForm";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminPayaccountDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getPayaccount(id: string): Promise<AdminPayaccountDetail | null> {
  try {
    return await adminFetch<AdminPayaccountDetail>(`/payaccounts/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Edit Pay Account" };

export default async function PayaccountDetailPage({ params }: Props) {
  const { id } = await params;
  const payaccount = await getPayaccount(id);

  if (!payaccount) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/payaccounts" className="text-sm text-primary hover:text-primary-dark">
        ← Pay Accounts
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">{payaccount.gateway_display}</h1>

      <Card className="p-8" hover={false}>
        <PayaccountEditForm payaccount={payaccount} />
      </Card>
    </div>
  );
}
