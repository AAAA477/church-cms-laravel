import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import ChurchSettingsForm from "@/components/admin/ChurchSettingsForm";
import { adminFetch } from "@/lib/api";
import type { AdminChurchSettings } from "@/lib/api-types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await adminFetch<AdminChurchSettings>("/church-settings");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Settings</h1>

      <Card className="p-8" hover={false}>
        <ChurchSettingsForm settings={settings} />
      </Card>
    </div>
  );
}
