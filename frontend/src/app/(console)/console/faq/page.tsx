import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import FaqCategoryCreateForm from "@/components/admin/FaqCategoryCreateForm";
import FaqCreateForm from "@/components/admin/FaqCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminFaq, AdminFaqCategory } from "@/lib/api-types";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const [categories, faqs] = await Promise.all([
    adminFetch<AdminFaqCategory[]>("/faq-categories"),
    adminFetch<{ data: AdminFaq[] }>("/faq"),
  ]);

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">FAQ</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-xl text-ink mb-4">Categories</h2>
        <FaqCategoryCreateForm />
        {categories.length > 0 && (
          <div className="space-y-2 mt-4">
            {categories.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-warm px-3 py-2">
                <span className="text-sm text-ink">{c.name}</span>
                <div className="flex items-center gap-2">
                  <QuickEditForm
                    endpoint={`/bff/admin/faq-categories/${c.id}`}
                    fields={[{ name: "name", label: "Name", value: c.name, required: true }]}
                  />
                  <DeleteButton
                    endpoint={`/bff/admin/faq-categories/${c.id}`}
                    confirmText="Delete this category?"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add FAQ</h2>
        <FaqCreateForm categories={categories} />
      </Card>

      {faqs.data.length === 0 ? (
        <EmptyState title="No FAQs yet" message="Add your first FAQ above." />
      ) : (
        <div className="space-y-3">
          {faqs.data.map((faq) => (
            <Card key={faq.id} className="p-5" hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{faq.category}</p>
                  <p className="text-sm font-medium text-ink mt-1">{faq.question}</p>
                  <p className="text-sm text-ink-soft mt-1">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <QuickEditForm
                    endpoint={`/bff/admin/faq/${faq.id}`}
                    fields={[
                      {
                        name: "faq_category_id",
                        label: "Category",
                        value: faq.faq_category_id,
                        type: "select",
                        options: categoryOptions,
                        required: true,
                      },
                      { name: "question", label: "Question", value: faq.question, required: true },
                      { name: "answer", label: "Answer", value: faq.answer, type: "textarea", required: true },
                    ]}
                  />
                  <DeleteButton endpoint={`/bff/admin/faq/${faq.id}`} confirmText="Delete this FAQ?" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
