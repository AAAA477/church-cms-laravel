import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PayaccountStatusToggle from "@/components/admin/PayaccountStatusToggle";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch } from "@/lib/api";
import type { AdminPayaccountSummary } from "@/lib/api-types";

export const metadata: Metadata = { title: "Pay Accounts" };

export default async function PayaccountsPage() {
  const payaccounts = await adminFetch<AdminPayaccountSummary[]>("/payaccounts");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Pay Accounts</h1>
        <Button href="/console/payaccounts/new">Add Pay Account</Button>
      </div>

      {payaccounts.length === 0 ? (
        <EmptyState
          title="No pay accounts configured"
          message="Add a pay account to start accepting a payment method."
        />
      ) : (
        <div className="space-y-3">
          {payaccounts.map((account) => (
            <Card key={account.id} className="p-5" hover={false}>
              <div className="flex items-center justify-between gap-4">
                <Link href={`/console/payaccounts/${account.id}`} className="group">
                  <p className="text-sm font-medium text-ink group-hover:text-primary">{account.gateway_display}</p>
                  <p className="text-xs text-ink-soft">{account.gateway_name}</p>
                </Link>
                <div className="flex items-center gap-2">
                  <PayaccountStatusToggle payaccountId={account.id} active={account.status} />
                  <DeleteButton
                    endpoint={`/bff/admin/payaccounts/${account.id}`}
                    confirmText="Delete this pay account?"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
