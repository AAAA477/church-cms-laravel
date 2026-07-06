import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import { guestGet, ApiError } from "@/lib/api";
import { cleanHtml } from "@/lib/html";
import type { Post } from "@/lib/api-types";

type Comment = {
  id: number;
  name: string | null;
  comment: string;
  like_count: number;
  date: string;
};

type PostResponse = {
  data: Post;
  comments: {
    data: Comment[];
    total: number;
    current_page: number;
    last_page: number;
  };
};

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string): Promise<PostResponse | null> {
  try {
    return await guestGet<PostResponse>(`/post/{church}/${id}`, 600);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post?.data.title ?? "Post" };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  const { data, comments } = post;

  return (
    <article>
      <header className="hero-gradient texture-overlay">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-4 text-sm">
            {data.category && (
              <span className="font-medium uppercase tracking-[0.2em] text-primary">
                {data.category.name}
              </span>
            )}
            {data.date && <span className="text-ink-soft">{data.date}</span>}
          </div>
          <div className="mx-auto mb-6 h-[3px] w-[60px] bg-primary" aria-hidden />
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            {data.title}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {data.cover && (
          <div className="relative h-72 sm:h-96 mb-12 rounded-sm overflow-hidden shadow-sm">
            <Image
              src={data.cover}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              preload
            />
          </div>
        )}

        <div
          className="text-ink-soft leading-relaxed space-y-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_a]:text-primary [&_a]:underline [&_img]:rounded-sm"
          dangerouslySetInnerHTML={{ __html: cleanHtml(data.description) }}
        />

        {data.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs bg-warm text-ink-soft"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <section className="mt-16 border-t border-warm-deep pt-12">
          <h2 className="font-display text-3xl text-ink mb-8">
            Comments {comments.total > 0 && `(${comments.total})`}
          </h2>

          {comments.data.length === 0 ? (
            <p className="text-ink-soft">No comments yet.</p>
          ) : (
            <ul className="space-y-6">
              {comments.data.map((comment) => (
                <li key={comment.id} className="bg-white rounded-sm shadow-sm p-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="font-medium text-ink">
                      {comment.name ?? "Guest"}
                    </p>
                    <p className="text-xs text-ink-soft">{comment.date}</p>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {comment.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-sm text-ink-soft">
            Members can comment after signing in — coming soon.
          </p>
        </section>

        <div className="mt-16 text-center">
          <Button href="/blog" variant="outline">
            All Posts
          </Button>
        </div>
      </div>
    </article>
  );
}
