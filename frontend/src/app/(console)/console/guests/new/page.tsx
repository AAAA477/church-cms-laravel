import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import GuestCreateForm from "@/components/admin/GuestCreateForm";

export const metadata: Metadata = { title: "Add Guest" };

export default function NewGuestPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/guests" className="text-sm text-primary hover:text-primary-dark">
        ← Guests
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Guest</h1>

      <Card className="p-8" hover={false}>
        <GuestCreateForm />
      </Card>
    </div>
  );
}
