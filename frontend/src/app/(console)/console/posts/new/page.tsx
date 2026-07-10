import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import PostCreateForm from "@/components/admin/PostCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminPostCategory } from "@/lib/api-types";

export const metadata: Metadata = { title: "Add Devotion" };

export default async function NewPostPage() {
  const categories = await adminFetch<AdminPostCategory[]>("/post-categories");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/posts" className="text-sm text-primary hover:text-primary-dark">
        ← Posts
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Devotion</h1>

      <Card className="p-8" hover={false}>
        <PostCreateForm categories={categories} />
      </Card>
    </div>
  );
}
