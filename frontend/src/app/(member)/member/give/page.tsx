import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DonationForm from "@/components/member/DonationForm";
import GivingHistory from "@/components/member/GivingHistory";
import { memberFetch } from "@/lib/api";
import type { Donation, PayGateway } from "@/lib/api-types";

export const metadata: Metadata = { title: "Give" };

export default async function GivePage() {
  const [gateways, history] = await Promise.all([
    memberFetch<PayGateway[]>("/donate/gateways"),
    memberFetch<{ data: Donation[] }>("/donate/history"),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-10">Give</h1>

      <Card className="p-8 mb-10" hover={false}>
        {gateways.length === 0 ? (
          <p className="text-ink-soft text-center">
            Online giving isn&apos;t set up yet — please contact your church
            admin.
          </p>
        ) : (
          <DonationForm gateways={gateways} />
        )}
      </Card>

      <h2 className="font-display text-2xl text-ink mb-4">Giving History</h2>
      <Card className="p-6" hover={false}>
        <GivingHistory donations={history.data} />
      </Card>
    </div>
  );
}
