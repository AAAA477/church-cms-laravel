import type { Metadata } from "next";
import Card from "@/components/ui/Card";

export const metadata: Metadata = { title: "Give" };

export default function GivePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-6">Give</h1>
      <Card className="p-8 text-center" hover={false}>
        <p className="text-ink-soft">
          Online giving is coming soon — this will support M-Pesa, Stripe and
          GCash.
        </p>
      </Card>
    </div>
  );
}
