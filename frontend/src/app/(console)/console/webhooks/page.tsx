import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Webhooks" };

type WebhookRow = {
  id: number;
  name: string;
  verb: string;
  url: string;
  mailinglist: string | null;
  mailinglist_id: number;
  handshake_key: string | null;
  status: boolean;
};

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const verbOptions = ["GET", "POST", "PUT", "DELETE"].map((v) => ({ value: v, label: v }));

export default async function WebhooksPage() {
  const [webhooks, lists] = await Promise.all([
    adminFetch<WebhookRow[]>("/webhooks"),
    adminFetch<{ data: { id: number; name: string }[] }>("/mailing-lists"),
  ]);

  const listOptions = lists.data.map((l) => ({ value: String(l.id), label: l.name }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Webhooks</h1>
      <p className="text-sm text-ink-soft mb-8">
        Outbound hooks fired for a mailing list, secured with a handshake key.
      </p>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Webhook</h2>
        {listOptions.length === 0 ? (
          <p className="text-sm text-ink-soft">Create a mailing list first — webhooks attach to one.</p>
        ) : (
          <QuickCreateForm
            endpoint="/bff/admin/webhooks"
            fields={[
              { name: "name", label: "Name", value: null, required: true },
              { name: "verb", label: "HTTP Verb", value: "POST", type: "select", options: verbOptions, required: true },
              { name: "url", label: "URL", value: null, required: true },
              { name: "mailinglist_id", label: "Mailing List", value: null, type: "select", options: listOptions, required: true },
              { name: "handshake_key", label: "Handshake Key", value: null },
              { name: "status", label: "Status", value: "1", type: "select", options: statusOptions, required: true },
            ]}
          />
        )}
      </Card>

      <div className="space-y-3">
        {webhooks.map((hook) => (
          <Card key={hook.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{hook.name}</p>
                <p className="text-xs text-ink-soft truncate">
                  {hook.verb} {hook.url} · {hook.mailinglist ?? "—"} ·{" "}
                  <span className={hook.status ? "text-green-700" : "text-red-700"}>
                    {hook.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/webhooks/${hook.id}`}
                  fields={[
                    { name: "name", label: "Name", value: hook.name, required: true },
                    { name: "verb", label: "HTTP Verb", value: hook.verb, type: "select", options: verbOptions, required: true },
                    { name: "url", label: "URL", value: hook.url, required: true },
                    { name: "mailinglist_id", label: "Mailing List", value: String(hook.mailinglist_id), type: "select", options: listOptions, required: true },
                    { name: "handshake_key", label: "Handshake Key", value: hook.handshake_key },
                    { name: "status", label: "Status", value: hook.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                  ]}
                />
                <DeleteButton endpoint={`/bff/admin/webhooks/${hook.id}`} confirmText="Delete this webhook?" />
              </div>
            </div>
          </Card>
        ))}
        {webhooks.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">No webhooks yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
