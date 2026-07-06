import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import PageCreateForm from "@/components/admin/PageCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminPageCategory } from "@/lib/api-types";

export const metadata: Metadata = { title: "Add Page" };

export default async function NewPagePage() {
  const categories = await adminFetch<AdminPageCategory[]>("/page-categories");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/pages" className="text-sm text-primary hover:text-primary-dark">
        ← Pages
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Page</h1>

      <Card className="p-8" hover={false}>
        <PageCreateForm categories={categories} />
      </Card>
    </div>
  );
}
