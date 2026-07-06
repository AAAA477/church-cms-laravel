import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Email Templates" };

type EmailRow = {
  id: number;
  subject: string;
  from_email: string;
  from_name: string;
  created_at: string | null;
};

type EmailDetail = EmailRow & { reply_to_email: string; content: string };

export default async function EmailsPage() {
  const emails = await adminFetch<EmailRow[]>("/emails");

  // The list endpoint omits content; fetch details for inline editing.
  const details = await Promise.all(
    emails.map((e) => adminFetch<EmailDetail>(`/emails/${e.id}`).catch(() => null)),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Emails</h1>
      <p className="text-sm text-ink-soft mb-8">
        Reusable templates (subject, sender, body) used by Email Blaster campaigns.
      </p>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Email</h2>
        <QuickCreateForm
          endpoint="/bff/admin/emails"
          fields={[
            { name: "subject", label: "Subject", value: null, required: true },
            { name: "from_name", label: "From Name", value: null, required: true },
            { name: "from_email", label: "From Email", value: null, required: true },
            { name: "reply_to_email", label: "Reply-To Email", value: null, required: true },
            { name: "content", label: "Content (HTML)", value: null, type: "textarea", required: true },
          ]}
        />
      </Card>

      <div className="space-y-3">
        {details.filter(Boolean).map((email) => (
          <Card key={email!.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{email!.subject}</p>
                <p className="text-xs text-ink-soft">
                  {email!.from_name} &lt;{email!.from_email}&gt;
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/emails/${email!.id}`}
                  fields={[
                    { name: "subject", label: "Subject", value: email!.subject, required: true },
                    { name: "from_name", label: "From Name", value: email!.from_name, required: true },
                    { name: "from_email", label: "From Email", value: email!.from_email, required: true },
                    { name: "reply_to_email", label: "Reply-To Email", value: email!.reply_to_email, required: true },
                    { name: "content", label: "Content (HTML)", value: email!.content, type: "textarea", required: true },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/emails/${email!.id}`}
                  confirmText="Delete this email template?"
                />
              </div>
            </div>
          </Card>
        ))}
        {emails.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">No email templates yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
