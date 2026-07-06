import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Pagination from "@/components/admin/Pagination";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Mails Delivered" };

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

export default async function MailsDeliveredPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const params = new URLSearchParams({ delivered: "1" });
  if (page) params.set("page", page);

  const mails = await adminFetch<{
    data: MailRow[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/mailqueues?${params}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Mails Delivered</h1>
      <p className="text-sm text-ink-soft mb-8">
        {mails.meta.total} delivered mail(s) — queue entries that have been fired.
      </p>

      <div className="space-y-3">
        {mails.data.map((mail) => (
          <Card key={mail.id} className="p-4" hover={false}>
            <p className="text-sm font-medium text-ink truncate">{mail.subject}</p>
            <p className="text-xs text-ink-soft">
              to {mail.to_mail} · from {mail.from_email} ·{" "}
              <span className="text-green-700">delivered {mail.fired_at}</span>
            </p>
          </Card>
        ))}
        {mails.data.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">No delivered mails yet.</p>
          </Card>
        )}
      </div>

      <Pagination
        currentPage={mails.meta.current_page}
        lastPage={mails.meta.last_page}
        basePath="/console/mails-delivered"
        searchParams={{}}
      />
    </div>
  );
}
