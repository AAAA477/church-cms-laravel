import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import MessageSendForm from "@/components/admin/MessageSendForm";

export const metadata: Metadata = { title: "Send Message" };

export default function NewMessagePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/messages" className="text-sm text-primary hover:text-primary-dark">
        ← Messages
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Send Message</h1>

      <Card className="p-8" hover={false}>
        <MessageSendForm />
      </Card>
    </div>
  );
}
