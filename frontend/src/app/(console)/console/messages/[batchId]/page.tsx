import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminMessageDetail } from "@/lib/api-types";

type Props = { params: Promise<{ batchId: string }> };

async function getBatch(batchId: string): Promise<AdminMessageDetail[] | null> {
  try {
    return await adminFetch<AdminMessageDetail[]>(`/messages/${batchId}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Message Batch" };

export default async function MessageBatchPage({ params }: Props) {
  const { batchId } = await params;
  const messages = await getBatch(batchId);

  if (!messages) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/messages" className="text-sm text-primary hover:text-primary-dark">
        ← Messages
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">
        {messages[0]?.subject || "(no subject)"} — {messages.length} recipient(s)
      </h1>

      <Card className="p-8" hover={false}>
        <p className="text-ink whitespace-pre-wrap mb-6">{messages[0]?.message}</p>
        <div className="border-t border-warm-deep pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-2">Sent To</p>
          <ul className="space-y-1 text-sm text-ink">
            {messages.map((m) => (
              <li key={m.id}>{m.to ?? "Unknown"}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
