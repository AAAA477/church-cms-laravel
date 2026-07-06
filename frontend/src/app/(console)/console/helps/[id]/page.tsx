import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import HelpStatusForm from "@/components/admin/HelpStatusForm";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminHelp } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getHelp(id: string): Promise<AdminHelp | null> {
  try {
    return await adminFetch<AdminHelp>(`/helps/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Help Request" };

export default async function HelpDetailPage({ params }: Props) {
  const { id } = await params;
  const help = await getHelp(id);

  if (!help) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/helps" className="text-sm text-primary hover:text-primary-dark">
        ← Help Requests
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">{help.title ?? "Untitled request"}</h1>

      <Card className="p-8 mb-6" hover={false}>
        <p className="text-ink whitespace-pre-wrap">{help.description}</p>
        {help.contact_details && <p className="text-sm text-ink-soft mt-3">Contact: {help.contact_details}</p>}
        <p className="text-sm text-ink-soft mt-3">
          Submitted by {help.user ?? "Unknown"} on {new Date(help.created_at).toLocaleString()}
        </p>
        {help.comments && <p className="text-sm text-ink-soft mt-2">Comments: {help.comments}</p>}
        {help.expired_at && (
          <p className="text-xs text-ink-soft mt-2">Expires {new Date(help.expired_at).toLocaleDateString()}</p>
        )}
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Update Status</h2>
        <HelpStatusForm help={help} />
      </Card>
    </div>
  );
}
