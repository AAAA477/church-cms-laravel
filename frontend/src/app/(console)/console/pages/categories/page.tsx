import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import PageCategoryCreateForm from "@/components/admin/PageCategoryCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminPageCategory } from "@/lib/api-types";

export const metadata: Metadata = { title: "Page Categories" };

export default async function PageCategoriesPage() {
  const categories = await adminFetch<AdminPageCategory[]>("/page-categories");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/pages" className="text-sm text-primary hover:text-primary-dark">
        ← Pages
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Page Categories</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Category</h2>
        <PageCategoryCreateForm />
      </Card>

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{category.name}</p>
                {category.description && <p className="text-xs text-ink-soft">{category.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/page-categories/${category.id}`}
                  fields={[
                    { name: "name", label: "Name", value: category.name, required: true },
                    { name: "sort_order", label: "Sort Order", value: category.sort_order, type: "number" },
                    { name: "description", label: "Description", value: category.description, type: "textarea" },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/page-categories/${category.id}`}
                  confirmText="Delete this category?"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
