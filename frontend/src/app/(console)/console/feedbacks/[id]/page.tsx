import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import FeedbackMessageActions from "@/components/admin/FeedbackMessageActions";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminFeedbackDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getFeedback(id: string): Promise<AdminFeedbackDetail | null> {
  try {
    return await adminFetch<AdminFeedbackDetail>(`/feedbacks/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const metadata: Metadata = { title: "Feedback Thread" };

export default async function FeedbackDetailPage({ params }: Props) {
  const { id } = await params;
  const feedback = await getFeedback(id);

  if (!feedback) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/feedbacks" className="text-sm text-primary hover:text-primary-dark">
        ← Feedbacks
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">Feedback from {feedback.user ?? "Unknown"}</h1>

      <div className="space-y-4">
        {feedback.messages.map((message) => (
          <Card key={message.id} className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                  {message.category}
                </span>
                <p className="text-ink mt-1 whitespace-pre-wrap">{message.message}</p>
                <p className="text-xs text-ink-soft mt-2">{new Date(message.created_at).toLocaleString()}</p>
              </div>
              <FeedbackMessageActions messageId={message.id} isSeen={message.is_seen} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
