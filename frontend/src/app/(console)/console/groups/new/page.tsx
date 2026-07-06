import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import GroupCreateForm from "@/components/admin/GroupCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminGroupCategory } from "@/lib/api-types";

export const metadata: Metadata = { title: "Add Group" };

export default async function NewGroupPage() {
  const categories = await adminFetch<AdminGroupCategory[]>("/group-categories");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/groups" className="text-sm text-primary hover:text-primary-dark">
        ← Groups
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Group</h1>

      <Card className="p-8" hover={false}>
        <GroupCreateForm categories={categories} />
      </Card>
    </div>
  );
}
