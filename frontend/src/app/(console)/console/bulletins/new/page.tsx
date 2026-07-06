import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import BulletinCreateForm from "@/components/admin/BulletinCreateForm";

export const metadata: Metadata = { title: "Upload Bulletin" };

export default function NewBulletinPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/bulletins" className="text-sm text-primary hover:text-primary-dark">
        ← Bulletins
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Upload Bulletin</h1>

      <Card className="p-8" hover={false}>
        <BulletinCreateForm />
      </Card>
    </div>
  );
}
