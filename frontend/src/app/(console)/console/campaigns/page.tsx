import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import CampaignCreateForm from "@/components/admin/CampaignCreateForm";
import CampaignStatusToggle from "@/components/admin/CampaignStatusToggle";
import { adminFetch } from "@/lib/api";
import type { AdminCampaign, AdminMailingList } from "@/lib/api-types";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage() {
  const [campaigns, mailingLists] = await Promise.all([
    adminFetch<{ data: AdminCampaign[] }>("/campaigns"),
    adminFetch<{ data: AdminMailingList[] }>("/mailing-lists"),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Campaigns</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Campaign</h2>
        <CampaignCreateForm mailingLists={mailingLists.data} />
      </Card>

      {campaigns.data.length === 0 ? (
        <EmptyState title="No campaigns yet" message="Create your first campaign to get started." />
      ) : (
        <div className="space-y-3">
          {campaigns.data.map((campaign) => (
            <Card key={campaign.id} className="p-5" hover={false}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{campaign.name}</p>
                  <p className="text-xs text-ink-soft">{campaign.mailinglist_name ?? "No mailing list"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CampaignStatusToggle campaignId={campaign.id} active={campaign.status} />
                  <QuickEditForm
                    endpoint={`/bff/admin/campaigns/${campaign.id}`}
                    fields={[
                      { name: "name", label: "Name", value: campaign.name, required: true },
                      {
                        name: "mailinglist_id",
                        label: "Mailing List",
                        value: campaign.mailinglist_id,
                        type: "select",
                        options: [
                          { value: "", label: "—" },
                          ...mailingLists.data.map((l) => ({ value: String(l.id), label: l.name })),
                        ],
                      },
                      { name: "description", label: "Description", value: campaign.description, type: "textarea" },
                    ]}
                  />
                  <DeleteButton endpoint={`/bff/admin/campaigns/${campaign.id}`} confirmText="Delete this campaign?" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
