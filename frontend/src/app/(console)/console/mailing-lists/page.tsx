import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import MailingListCreateForm from "@/components/admin/MailingListCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminMailingList } from "@/lib/api-types";

export const metadata: Metadata = { title: "Mailing Lists" };

export default async function MailingListsPage() {
  const result = await adminFetch<{ data: AdminMailingList[] }>("/mailing-lists");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Mailing Lists</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Mailing List</h2>
        <MailingListCreateForm />
      </Card>

      <div className="space-y-3">
        {result.data.map((list) => (
          <Card key={list.id} className="p-5" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href={`/console/mailing-lists/${list.id}`} className="text-sm font-medium text-ink hover:text-primary">
                  {list.name}
                </Link>
                <p className="text-xs text-ink-soft">
                  {list.scope} · {list.subscriber_count ?? 0} subscriber(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/mailing-lists/${list.id}`}
                  fields={[
                    { name: "name", label: "Name", value: list.name, required: true },
                    {
                      name: "scope",
                      label: "Scope",
                      value: list.scope,
                      type: "select",
                      options: [
                        { value: "subscription", label: "Subscription" },
                        { value: "campaign", label: "Campaign" },
                        { value: "segment", label: "Segment" },
                      ],
                    },
                    { name: "description", label: "Description", value: list.description, type: "textarea" },
                  ]}
                />
                <DeleteButton endpoint={`/bff/admin/mailing-lists/${list.id}`} confirmText="Delete this mailing list?" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
