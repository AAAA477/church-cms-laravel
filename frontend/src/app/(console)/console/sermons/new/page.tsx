import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import SermonCreateForm from "@/components/admin/SermonCreateForm";

export const metadata: Metadata = { title: "Add Sermon" };

export default function NewSermonPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/sermons" className="text-sm text-primary hover:text-primary-dark">
        ← Sermons
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Sermon</h1>

      <Card className="p-8" hover={false}>
        <SermonCreateForm />
      </Card>
    </div>
  );
}
