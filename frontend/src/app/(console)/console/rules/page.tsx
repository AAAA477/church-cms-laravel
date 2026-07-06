import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Email Rules" };

type RuleRow = {
  id: number;
  name: string;
  campaign: string | null;
  campaign_id: number;
  email_open_campaign_id: number | null;
  no_email_open_campaign_id: number | null;
  day_after: number;
  status: boolean;
};

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export default async function RulesPage() {
  const [rules, campaigns] = await Promise.all([
    adminFetch<RuleRow[]>("/rules"),
    adminFetch<{ data: { id: number; name: string }[] }>("/campaigns"),
  ]);

  const campaignOptions = campaigns.data.map((c) => ({ value: String(c.id), label: c.name }));
  const optionalCampaignOptions = [{ value: "", label: "— none —" }, ...campaignOptions];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Rules</h1>
      <p className="text-sm text-ink-soft mb-8">
        Automation rules: after N days, move a campaign&apos;s openers / non-openers into
        follow-up campaigns.
      </p>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Rule</h2>
        {campaignOptions.length === 0 ? (
          <p className="text-sm text-ink-soft">Create a campaign first — rules watch campaigns.</p>
        ) : (
          <QuickCreateForm
            endpoint="/bff/admin/rules"
            fields={[
              { name: "name", label: "Name", value: null, required: true },
              { name: "campaign_id", label: "Watch Campaign", value: null, type: "select", options: campaignOptions, required: true },
              { name: "email_open_campaign_id", label: "Openers → Campaign", value: "", type: "select", options: optionalCampaignOptions },
              { name: "no_email_open_campaign_id", label: "Non-openers → Campaign", value: "", type: "select", options: optionalCampaignOptions },
              { name: "day_after", label: "Days After", value: 3, type: "number", required: true },
              { name: "status", label: "Status", value: "1", type: "select", options: statusOptions, required: true },
            ]}
          />
        )}
      </Card>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{rule.name}</p>
                <p className="text-xs text-ink-soft">
                  watches {rule.campaign ?? `campaign #${rule.campaign_id}`} · after {rule.day_after} day(s) ·{" "}
                  <span className={rule.status ? "text-green-700" : "text-red-700"}>
                    {rule.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/rules/${rule.id}`}
                  fields={[
                    { name: "name", label: "Name", value: rule.name, required: true },
                    { name: "campaign_id", label: "Watch Campaign", value: String(rule.campaign_id), type: "select", options: campaignOptions, required: true },
                    { name: "email_open_campaign_id", label: "Openers → Campaign", value: rule.email_open_campaign_id ? String(rule.email_open_campaign_id) : "", type: "select", options: optionalCampaignOptions },
                    { name: "no_email_open_campaign_id", label: "Non-openers → Campaign", value: rule.no_email_open_campaign_id ? String(rule.no_email_open_campaign_id) : "", type: "select", options: optionalCampaignOptions },
                    { name: "day_after", label: "Days After", value: rule.day_after, type: "number", required: true },
                    { name: "status", label: "Status", value: rule.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                  ]}
                />
                <DeleteButton endpoint={`/bff/admin/rules/${rule.id}`} confirmText="Delete this rule?" />
              </div>
            </div>
          </Card>
        ))}
        {rules.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">No rules yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
