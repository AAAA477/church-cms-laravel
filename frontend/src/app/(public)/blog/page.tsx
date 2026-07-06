import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import PageHeader from "@/components/site/PageHeader";
import PostCard from "@/components/cards/PostCard";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";
import type { Paginated, Post } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, stories and reflections from our community.",
};

type Category = { id: number; name: string; posts_count: number };

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { category, page } = await searchParams;

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (page) query.set("page", page);
  const qs = query.size > 0 ? `?${query}` : "";

  const posts = await guestGet<Paginated<Post> & { categories: Category[] }>(
    `/posts/{church}${qs}`,
  );

  return (
    <>
      <PageHeader
        overline="Stories & News"
        title="Blog"
        subtitle="News, stories and reflections from our community."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              <Link
                href="/blog"
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
                  href={`/blog?category=${c.id}`}
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
              title="No posts yet"
              message="Stories from our community will appear here."
              ctaLabel="Back to Home"
              ctaHref="/"
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {posts.meta.last_page > 1 && (
            <nav className="mt-16 flex justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: posts.meta.last_page }, (_, i) => i + 1).map(
                (p) => {
                  const params = new URLSearchParams();
                  if (category) params.set("category", category);
                  if (p > 1) params.set("page", String(p));
                  const href = params.size > 0 ? `/blog?${params}` : "/blog";
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
