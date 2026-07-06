import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import PrayerCategoryCreateForm from "@/components/admin/PrayerCategoryCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminPrayerCategory } from "@/lib/api-types";

export const metadata: Metadata = { title: "Prayer Categories" };

export default async function PrayerCategoriesPage() {
  const categories = await adminFetch<AdminPrayerCategory[]>("/prayer-categories");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/prayer-board" className="text-sm text-primary hover:text-primary-dark">
        ← Prayer Board
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Prayer Categories</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Category</h2>
        <PrayerCategoryCreateForm />
      </Card>

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-ink">{category.name}</p>
                  {category.description && <p className="text-xs text-ink-soft">{category.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/prayer-categories/${category.id}`}
                  fields={[
                    { name: "name", label: "Name", value: category.name, required: true },
                    { name: "emoji", label: "Emoji", value: category.emoji, required: true },
                    { name: "sort_order", label: "Sort Order", value: category.sort_order, type: "number", required: true },
                    { name: "description", label: "Description", value: category.description, type: "textarea" },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/prayer-categories/${category.id}`}
                  confirmText="Delete this category? Categories with active or pending prayers can't be deleted."
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
