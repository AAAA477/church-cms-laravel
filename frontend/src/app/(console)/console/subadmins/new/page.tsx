import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import SubAdminCreateForm from "@/components/admin/SubAdminCreateForm";

export const metadata: Metadata = { title: "Add Sub-Admin" };

export default function NewSubAdminPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/subadmins" className="text-sm text-primary hover:text-primary-dark">
        ← Sub-Admins
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Sub-Admin</h1>

      <Card className="p-8" hover={false}>
        <SubAdminCreateForm />
      </Card>
    </div>
  );
}
