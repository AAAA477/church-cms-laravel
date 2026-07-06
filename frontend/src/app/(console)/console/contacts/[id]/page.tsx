import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminContact } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getContact(id: string): Promise<AdminContact | null> {
  try {
    return await adminFetch<AdminContact>(`/contacts/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Contact Request" };

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/contacts" className="text-sm text-primary hover:text-primary-dark">
        ← Contact Requests
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">{contact.fullname}</h1>

      <Card className="p-8" hover={false}>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Email</dt>
            <dd className="text-ink">{contact.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Mobile</dt>
            <dd className="text-ink">{contact.mobile}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Submitted</dt>
            <dd className="text-ink">{new Date(contact.date_of_submission).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Message</dt>
            <dd className="text-ink whitespace-pre-wrap">{contact.query}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
