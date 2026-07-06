import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import NewsletterSendForm from "@/components/admin/NewsletterSendForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Send Newsletter" };

export default async function NewsletterPage() {
  const counts = await adminFetch<{ subscribed: number; unsubscribed: number }>("/newsletter");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Send Newsletter</h1>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <Card className="p-6" hover={false}>
          <p className="font-display text-3xl text-primary">{counts.subscribed}</p>
          <p className="text-sm text-ink-soft">Subscribed recipients</p>
        </Card>
        <Card className="p-6" hover={false}>
          <p className="font-display text-3xl text-ink-soft">{counts.unsubscribed}</p>
          <p className="text-sm text-ink-soft">Unsubscribed</p>
        </Card>
      </div>

      <Card className="p-8" hover={false}>
        <NewsletterSendForm />
      </Card>
    </div>
  );
}
