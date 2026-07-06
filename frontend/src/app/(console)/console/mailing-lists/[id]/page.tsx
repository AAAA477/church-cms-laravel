import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import { adminFetch } from "@/lib/api";
import type { AdminMailingListSubscriber } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Mailing List Subscribers" };

export default async function MailingListDetailPage({ params }: Props) {
  const { id } = await params;
  const subscribers = await adminFetch<AdminMailingListSubscriber[]>(`/mailing-lists/${id}/subscribers`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/mailing-lists" className="text-sm text-primary hover:text-primary-dark">
        ← Mailing Lists
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">Subscribers</h1>

      <Card className="p-2" hover={false}>
        {subscribers.length === 0 ? (
          <p className="text-sm text-ink-soft p-6">
            No subscribers attached yet. Attach one from the{" "}
            <Link href="/console/subscribers" className="text-primary hover:text-primary-dark">
              Subscribers
            </Link>{" "}
            page.
          </p>
        ) : (
          <div className="divide-y divide-warm-deep">
            {subscribers.map((s) => (
              <div key={s.link_id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm text-ink">{s.name || "—"}</p>
                  <p className="text-xs text-ink-soft">{s.email}</p>
                </div>
                <DeleteButton
                  endpoint={`/bff/admin/subscribers/detach/${s.link_id}`}
                  confirmText="Remove this subscriber from the list?"
                  label="Detach"
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
