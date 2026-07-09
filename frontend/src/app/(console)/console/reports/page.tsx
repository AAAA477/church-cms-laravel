import type { Metadata } from "next";
import Card from "@/components/ui/Card";

export const metadata: Metadata = { title: "Data Exports" };

const EXPORTS = [
  { type: "member", status: "", label: "All Members" },
  { type: "member", status: "active", label: "Active Members" },
  { type: "member", status: "inactive", label: "Inactive Members" },
  { type: "guest", status: "", label: "All Guests" },
];

export default function ReportsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Data Exports</h1>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Export to CSV</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXPORTS.map((exp) => {
            const params = new URLSearchParams({ type: exp.type });
            if (exp.status) params.set("status", exp.status);
            return (
              <a
                key={exp.label}
                href={`/bff/admin/reports/export?${params}`}
                className="inline-flex items-center justify-center font-medium uppercase tracking-wider text-sm rounded-sm px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                {exp.label}
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
