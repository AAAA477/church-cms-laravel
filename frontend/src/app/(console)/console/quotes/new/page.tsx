import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import QuoteCreateForm from "@/components/admin/QuoteCreateForm";

export const metadata: Metadata = { title: "Add Quote" };

export default function NewQuotePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/quotes" className="text-sm text-primary hover:text-primary-dark">
        ← Quotes
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Quote</h1>

      <Card className="p-8" hover={false}>
        <QuoteCreateForm />
      </Card>
    </div>
  );
}
