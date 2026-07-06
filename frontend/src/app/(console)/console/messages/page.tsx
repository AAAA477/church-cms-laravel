import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";
import type { AdminMessageBatch } from "@/lib/api-types";

export const metadata: Metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const qs = page ? `?page=${page}` : "";

  const result = await adminFetch<{
    data: AdminMessageBatch[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/messages${qs}`);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Messages</h1>
        <Button href="/console/messages/new">Send Message</Button>
      </div>

      {result.data.length === 0 ? (
        <EmptyState title="No messages sent yet" message="Send your first message to members or guests." />
      ) : (
        <div className="space-y-3">
          {result.data.map((batch) => (
            <Link key={batch.batch_id} href={`/console/messages/${batch.batch_id}`}>
              <Card className="p-5" hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{batch.subject || "(no subject)"}</p>
                    <p className="text-sm text-ink-soft line-clamp-2 mt-1">{batch.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-warm text-ink-soft">
                      {batch.mode}
                    </span>
                    <p className="text-xs text-ink-soft mt-1">{batch.recipients} recipient(s)</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={result.meta.current_page}
        lastPage={result.meta.last_page}
        basePath="/console/messages"
        searchParams={{}}
      />
    </div>
  );
}
