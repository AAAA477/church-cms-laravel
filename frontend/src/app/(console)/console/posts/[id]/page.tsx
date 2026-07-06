import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import PostEditForm from "@/components/admin/PostEditForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminPost, AdminPostCategory } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string): Promise<AdminPost | null> {
  try {
    return await adminFetch<AdminPost>(`/posts/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Edit Post" };

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  const categories = await adminFetch<AdminPostCategory[]>("/post-categories");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/posts" className="text-sm text-primary hover:text-primary-dark">
        ← Posts
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">{post.title || "(untitled post)"}</h1>
        <DeleteButton
          endpoint={`/bff/admin/posts/${post.id}`}
          confirmText="Delete this post permanently?"
          redirectTo="/console/posts"
        />
      </div>

      <Card className="p-8" hover={false}>
        <PostEditForm post={post} categories={categories} />
      </Card>
    </div>
  );
}
