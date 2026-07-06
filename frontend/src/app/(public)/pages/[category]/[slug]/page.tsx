import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PagesNav from "@/components/site/PagesNav";
import { guestGet, ApiError } from "@/lib/api";
import { cleanHtml } from "@/lib/html";
import type { CmsPage, PageNavGroup } from "@/lib/api-types";

type Props = { params: Promise<{ category: string; slug: string }> };

async function getPage(category: string, slug: string): Promise<CmsPage | null> {
  try {
    const res = await guestGet<{ data: CmsPage }>(
      `/page/{church}/${category}/${slug}`,
      600,
    );
    return res.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const page = await getPage(category, slug);
  return { title: page?.name ?? "Page" };
}

export default async function CmsPageDetail({ params }: Props) {
  const { category, slug } = await params;
  const [page, nav] = await Promise.all([
    getPage(category, slug),
    guestGet<{ data: PageNavGroup[] }>("/pages", 600),
  ]);

  if (!page) notFound();

  return (
    <>
      <header className="hero-gradient texture-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
          {page.category && (
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
              {page.category}
            </p>
          )}
          <div className="mx-auto mb-6 h-[3px] w-[60px] bg-primary" aria-hidden />
          <h1 className="font-display text-4xl sm:text-5xl text-ink">
            {page.name}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-12 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <PagesNav groups={nav.data} />
        </aside>

        <div className="lg:col-span-3">
          {page.cover_image && (
            <div className="relative h-64 sm:h-80 mb-10 rounded-sm overflow-hidden shadow-sm">
              <Image
                src={page.cover_image}
                alt={page.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
            </div>
          )}
          <div
            className="text-ink-soft leading-relaxed space-y-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-ink [&_a]:text-primary [&_a]:underline [&_img]:rounded-sm"
            dangerouslySetInnerHTML={{
              __html: cleanHtml(page.description ?? ""),
            }}
          />
        </div>
      </div>
    </>
  );
}
