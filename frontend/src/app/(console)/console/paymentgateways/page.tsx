import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Payment Gateways" };

type Gateway = {
  id: number;
  gatewayname: string;
  displayname: string;
  currency: string | null;
  instructions: string | null;
  status: boolean;
};

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export default async function PaymentGatewaysPage() {
  const gateways = await adminFetch<Gateway[]>("/paymentgateways/manage");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Payment Gateways</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Gateway</h2>
        <QuickCreateForm
          endpoint="/bff/admin/paymentgateways"
          fields={[
            { name: "gatewayname", label: "Gateway Key (e.g. stripe)", value: null, required: true },
            { name: "displayname", label: "Display Name", value: null, required: true },
            { name: "currency", label: "Default Currency", value: null },
            { name: "status", label: "Status", value: "1", type: "select", options: statusOptions, required: true },
            { name: "instructions", label: "Instructions", value: null, type: "textarea" },
          ]}
        />
      </Card>

      <div className="space-y-3">
        {gateways.map((gw) => (
          <Card key={gw.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {gw.displayname}{" "}
                  <span className="text-xs text-ink-soft">({gw.gatewayname})</span>
                </p>
                <p className="text-xs text-ink-soft">
                  {gw.currency ?? "—"} ·{" "}
                  <span className={gw.status ? "text-green-700" : "text-red-700"}>
                    {gw.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/paymentgateways/${gw.id}`}
                  fields={[
                    { name: "gatewayname", label: "Gateway Key", value: gw.gatewayname, required: true },
                    { name: "displayname", label: "Display Name", value: gw.displayname, required: true },
                    { name: "currency", label: "Default Currency", value: gw.currency },
                    { name: "status", label: "Status", value: gw.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                    { name: "instructions", label: "Instructions", value: gw.instructions, type: "textarea" },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/paymentgateways/${gw.id}`}
                  confirmText="Delete this gateway? Gateways with pay accounts attached can't be deleted."
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
