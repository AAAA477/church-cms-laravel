import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Post } from "@/lib/api-types";

/** Strip HTML tags for the excerpt. */
function excerpt(html: string, max = 140) {
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <Link href={`/devotions/${post.id}`} className="block">
        {post.cover && (
          <div className="relative h-48">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            {post.category && (
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                {post.category.name}
              </span>
            )}
            {post.date && (
              <span className="text-xs text-ink-soft">{post.date}</span>
            )}
          </div>
          <h3 className="font-display text-2xl text-ink mb-2">{post.title}</h3>
          <p className="text-sm text-ink-soft leading-relaxed">
            {excerpt(post.description)}
          </p>
        </div>
      </Link>
    </Card>
  );
}
