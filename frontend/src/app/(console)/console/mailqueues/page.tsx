import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import QuickEditForm from "@/components/admin/QuickEditForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Mail Queues" };

type MailRow = {
  id: number;
  to_mail: string;
  subject: string;
  from_email: string;
  status: string | null;
  scheduled_at: string | null;
  fired_at: string | null;
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function MailQueuesPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const qs = page ? `?page=${page}` : "";

  const mails = await adminFetch<{
    data: MailRow[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/mailqueues${qs}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Mail Queues</h1>
      <p className="text-sm text-ink-soft mb-8">
        {mails.meta.total} queued mail(s) — campaign emails waiting to be (or already) delivered.
      </p>

      <div className="space-y-3">
        {mails.data.map((mail) => (
          <Card key={mail.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{mail.subject}</p>
                <p className="text-xs text-ink-soft">
                  to {mail.to_mail} · scheduled {mail.scheduled_at ?? "—"} ·{" "}
                  {mail.fired_at ? (
                    <span className="text-green-700">fired {mail.fired_at}</span>
                  ) : (
                    <span className="text-amber-700">pending</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/mailqueues/${mail.id}`}
                  fields={[
                    { name: "fired_at", label: "Fired At (YYYY-MM-DD HH:MM:SS)", value: mail.fired_at, required: true },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/mailqueues/${mail.id}`}
                  confirmText="Delete this queued mail?"
                />
              </div>
            </div>
          </Card>
        ))}
        {mails.data.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">The mail queue is empty.</p>
          </Card>
        )}
      </div>

      <Pagination
        currentPage={mails.meta.current_page}
        lastPage={mails.meta.last_page}
        basePath="/console/mailqueues"
        searchParams={{}}
      />
    </div>
  );
}
