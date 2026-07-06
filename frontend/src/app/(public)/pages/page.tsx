import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { PageNavGroup } from "@/lib/api-types";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesIndex() {
  const nav = await guestGet<{ data: PageNavGroup[] }>("/pages");

  const first = nav.data[0]?.pages[0];
  if (first && nav.data[0].category_slug) {
    redirect(`/pages/${nav.data[0].category_slug}/${first.slug}`);
  }

  return (
    <>
      <PageHeader overline="About" title="Pages" />
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState
          title="No pages published yet"
          ctaLabel="Back to Home"
          ctaHref="/"
        />
      </div>
    </>
  );
}
