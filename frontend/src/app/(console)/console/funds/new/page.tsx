import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import FundCreateForm from "@/components/admin/FundCreateForm";

export const metadata: Metadata = { title: "Record Contribution" };

export default function NewFundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/funds" className="text-sm text-primary hover:text-primary-dark">
        ← Funds
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Record Contribution</h1>

      <Card className="p-8" hover={false}>
        <FundCreateForm />
      </Card>
    </div>
  );
}
