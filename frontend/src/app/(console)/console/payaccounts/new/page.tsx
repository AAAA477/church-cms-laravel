import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import PayaccountCreateForm from "@/components/admin/PayaccountCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminPaymentGateway } from "@/lib/api-types";

export const metadata: Metadata = { title: "Add Pay Account" };

export default async function NewPayaccountPage() {
  const gateways = await adminFetch<AdminPaymentGateway[]>("/payment-gateways");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/payaccounts" className="text-sm text-primary hover:text-primary-dark">
        ← Pay Accounts
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Pay Account</h1>

      <Card className="p-8" hover={false}>
        <PayaccountCreateForm gateways={gateways} />
      </Card>
    </div>
  );
}
