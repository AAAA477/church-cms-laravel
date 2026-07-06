import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import Accordion from "@/components/ui/Accordion";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { FaqCategory } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about our church and services.",
};

export default async function FaqPage() {
  const faqs = await guestGet<{ data: FaqCategory[] }>("/faqs");

  const categories = faqs.data.filter((c) => c.faqs.length > 0);

  return (
    <>
      <PageHeader
        overline="Questions"
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about our church, services and community."
      />
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length === 0 ? (
            <EmptyState
              title="No questions yet"
              message="Frequently asked questions will appear here."
              ctaLabel="Contact Us"
              ctaHref="/contact"
            />
          ) : (
            <div className="space-y-16">
              {categories.map((category) => (
                <div key={category.id}>
                  {categories.length > 1 && (
                    <h2 className="font-display text-3xl text-ink mb-8">
                      {category.name}
                    </h2>
                  )}
                  <Accordion items={category.faqs} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
