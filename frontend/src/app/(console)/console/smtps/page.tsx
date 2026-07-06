import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "SMTP Servers" };

type SmtpRow = {
  id: number;
  host: string;
  port: number;
  username: string;
  encryption: string;
  status: boolean;
};

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const encryptionOptions = [
  { value: "tls", label: "TLS" },
  { value: "ssl", label: "SSL" },
  { value: "none", label: "None" },
];

export default async function SmtpsPage() {
  const smtps = await adminFetch<SmtpRow[]>("/smtps");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">SMTP Servers</h1>
      <p className="text-sm text-ink-soft mb-8">
        Outgoing mail servers used by the Email Blaster to deliver campaigns.
      </p>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add SMTP Server</h2>
        <QuickCreateForm
          endpoint="/bff/admin/smtps"
          fields={[
            { name: "host", label: "Host", value: null, required: true },
            { name: "port", label: "Port", value: 587, type: "number", required: true },
            { name: "username", label: "Username", value: null, required: true },
            { name: "password", label: "Password", value: null, required: true },
            { name: "encryption", label: "Encryption", value: "tls", type: "select", options: encryptionOptions, required: true },
            { name: "status", label: "Status", value: "1", type: "select", options: statusOptions, required: true },
          ]}
        />
      </Card>

      <div className="space-y-3">
        {smtps.map((smtp) => (
          <Card key={smtp.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {smtp.host}:{smtp.port}
                </p>
                <p className="text-xs text-ink-soft">
                  {smtp.username} · {smtp.encryption.toUpperCase()} ·{" "}
                  <span className={smtp.status ? "text-green-700" : "text-red-700"}>
                    {smtp.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/smtps/${smtp.id}`}
                  fields={[
                    { name: "host", label: "Host", value: smtp.host, required: true },
                    { name: "port", label: "Port", value: smtp.port, type: "number", required: true },
                    { name: "username", label: "Username", value: smtp.username, required: true },
                    { name: "password", label: "Password", value: null, required: true },
                    { name: "encryption", label: "Encryption", value: smtp.encryption, type: "select", options: encryptionOptions, required: true },
                    { name: "status", label: "Status", value: smtp.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/smtps/${smtp.id}`}
                  confirmText="Delete this SMTP server?"
                />
              </div>
            </div>
          </Card>
        ))}
        {smtps.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">No SMTP servers configured yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
