import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EventCreateForm from "@/components/admin/EventCreateForm";

export const metadata: Metadata = { title: "Add Event" };

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/events" className="text-sm text-primary hover:text-primary-dark">
        ← Events
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Event</h1>

      <Card className="p-8" hover={false}>
        <EventCreateForm />
      </Card>
    </div>
  );
}
