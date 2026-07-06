import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DeleteButton from "@/components/admin/DeleteButton";
import SubscriberCreateForm from "@/components/admin/SubscriberCreateForm";
import SubscriberAttachForm from "@/components/admin/SubscriberAttachForm";
import { adminFetch } from "@/lib/api";
import type { AdminMailingList, AdminSubscriber } from "@/lib/api-types";

export const metadata: Metadata = { title: "Subscribers" };

type Props = { searchParams: Promise<{ search?: string; page?: string }> };

export default async function SubscribersPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const [subscribers, mailingListsResult] = await Promise.all([
    adminFetch<{
      data: AdminSubscriber[];
      meta: { current_page: number; last_page: number; total: number };
    }>(`/subscribers${qs}`),
    adminFetch<{ data: AdminMailingList[] }>("/mailing-lists"),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Subscribers</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Subscriber</h2>
        <SubscriberCreateForm />
      </Card>

      <div className="mb-6">
        <SearchBar placeholder="Search by email or name…" />
      </div>

      <div className="space-y-3">
        {subscribers.data.map((s) => (
          <Card key={s.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {s.firstname || s.lastname ? `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() : s.email}
                </p>
                <p className="text-xs text-ink-soft">{s.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <SubscriberAttachForm subscriberId={s.id} mailingLists={mailingListsResult.data} />
                <DeleteButton endpoint={`/bff/admin/subscribers/${s.id}`} confirmText="Delete this subscriber?" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={subscribers.meta.current_page}
        lastPage={subscribers.meta.last_page}
        basePath="/console/subscribers"
        searchParams={{ search }}
      />
    </div>
  );
}
