import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import MemberCreateForm from "@/components/admin/MemberCreateForm";

export const metadata: Metadata = { title: "Add Member" };

export default function NewMemberPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/members" className="text-sm text-primary hover:text-primary-dark">
        ← Members
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Member</h1>

      <Card className="p-8" hover={false}>
        <MemberCreateForm />
      </Card>
    </div>
  );
}
