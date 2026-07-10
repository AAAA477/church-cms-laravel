import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import PageHeader from "@/components/site/PageHeader";
import PostCard from "@/components/cards/PostCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { guestGet } from "@/lib/api";
import type { Paginated, Post } from "@/lib/api-types";

// Renamed from Blog (2026-07-10): posts are presented as devotions. The
// underlying posts API is unchanged; old /blog URLs redirect here.
export const metadata: Metadata = {
  title: "Devotions",
  description: "Daily devotions, reflections and encouragement from our community.",
};

type Category = { id: number; name: string; posts_count: number };

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

/** Strip HTML tags for the featured excerpt. */
function excerpt(html: string, max = 280) {
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function DevotionsPage({ searchParams }: Props) {
  const { category, page } = await searchParams;

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (page) query.set("page", page);
  const qs = query.size > 0 ? `?${query}` : "";

  const posts = await guestGet<Paginated<Post> & { categories: Category[] }>(
    `/posts/{church}${qs}`,
  );

  // Featured devotion: the newest one, shown only on the unfiltered first
  // page. "Today's Devotion" when it was published today (matches the
  // API's "d M Y" date format), otherwise "Latest Devotion".
  const featured = !category && (!page || page === "1") ? posts.data[0] : undefined;
  const rest = featured ? posts.data.slice(1) : posts.data;
  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/,/g, "");
  const featuredLabel = featured?.date === today ? "Today's Devotion" : "Latest Devotion";

  return (
    <>
      <PageHeader
        overline="Daily Bread"
        title="Devotions"
        subtitle="Daily devotions, reflections and encouragement from our community."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              <Link
                href="/devotions"
                className={clsx(
                  "px-4 py-1.5 rounded-full text-sm border transition-colors",
                  !category
                    ? "bg-primary border-primary text-white"
                    : "border-warm-deep text-ink-soft hover:border-primary hover:text-primary",
                )}
              >
                All
              </Link>
              {posts.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/devotions?category=${c.id}`}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-sm border transition-colors",
                    category === String(c.id)
                      ? "bg-primary border-primary text-white"
                      : "border-warm-deep text-ink-soft hover:border-primary hover:text-primary",
                  )}
                >
                  {c.name} ({c.posts_count})
                </Link>
              ))}
            </div>
          )}

          {posts.data.length === 0 ? (
            <EmptyState
              title="No devotions yet"
              message="Devotions and reflections will appear here."
              ctaLabel="Back to Home"
              ctaHref="/"
            />
          ) : (
            <>
              {featured && (
                <div className="mb-16 bg-warm rounded-sm overflow-hidden">
                  <div className="grid md:grid-cols-2 items-center">
                    {featured.cover && (
                      <div className="relative h-64 md:h-full md:min-h-80">
                        <Image
                          src={featured.cover}
                          alt={featured.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-8 sm:p-12">
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary mb-3">
                        {featuredLabel}
                        {featured.date && ` — ${featured.date}`}
                      </p>
                      <h2 className="font-display text-3xl sm:text-4xl text-ink mb-4">
                        {featured.title}
                      </h2>
                      <p className="text-ink-soft leading-relaxed mb-6">
                        {excerpt(featured.description)}
                      </p>
                      <Button href={`/devotions/${featured.id}`} variant="outline">
                        Read Devotion
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {rest.length > 0 && (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {posts.meta.last_page > 1 && (
            <nav className="mt-16 flex justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: posts.meta.last_page }, (_, i) => i + 1).map(
                (p) => {
                  const params = new URLSearchParams();
                  if (category) params.set("category", category);
                  if (p > 1) params.set("page", String(p));
                  const href = params.size > 0 ? `/devotions?${params}` : "/devotions";
                  return (
                    <Link
                      key={p}
                      href={href}
                      className={clsx(
                        "h-10 w-10 flex items-center justify-center rounded-sm text-sm border transition-colors",
                        p === posts.meta.current_page
                          ? "bg-primary border-primary text-white"
                          : "border-warm-deep text-ink-soft hover:border-primary hover:text-primary",
                      )}
                    >
                      {p}
                    </Link>
                  );
                },
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
