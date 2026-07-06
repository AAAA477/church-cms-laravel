import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import WidgetCreateForm from "@/components/admin/WidgetCreateForm";
import { adminFetch } from "@/lib/api";
import type { AdminWidget } from "@/lib/api-types";

export const metadata: Metadata = { title: "Widgets" };

export default async function WidgetsPage() {
  const result = await adminFetch<{ data: AdminWidget[] }>("/widgets");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Widgets</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Widget</h2>
        <WidgetCreateForm />
      </Card>

      {result.data.length === 0 ? (
        <EmptyState title="No widgets yet" message="Add your first widget above." />
      ) : (
        <div className="space-y-3">
          {result.data.map((widget) => (
            <Card key={widget.id} className="p-5" hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    {widget.page} {widget.position ? `· ${widget.position}` : ""}
                  </p>
                  <p className="text-sm text-ink-soft mt-1 line-clamp-2">{widget.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <QuickEditForm
                    endpoint={`/bff/admin/widgets/${widget.id}`}
                    fields={[
                      { name: "page", label: "Page", value: widget.page },
                      {
                        name: "position",
                        label: "Position",
                        value: widget.position,
                        type: "select",
                        options: [
                          { value: "top", label: "Top" },
                          { value: "bottom", label: "Bottom" },
                        ],
                      },
                      { name: "display_order", label: "Display Order", value: widget.display_order, type: "number" },
                      { name: "content", label: "Content (HTML)", value: widget.content, type: "textarea", required: true },
                    ]}
                  />
                  <DeleteButton endpoint={`/bff/admin/widgets/${widget.id}`} confirmText="Delete this widget?" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
