import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { memberFetch, ApiError } from "@/lib/api";

export const metadata: Metadata = { title: "Confirming Payment" };

type Props = {
  searchParams: Promise<{ status?: string; source_id?: string }>;
};

async function confirmGCashPayment(sourceId: string): Promise<"success" | "failed"> {
  try {
    await memberFetch("/donate/gcash-confirm", {
      method: "POST",
      body: JSON.stringify({ source_id: sourceId }),
    });
    return "success";
  } catch (e) {
    return e instanceof ApiError ? "failed" : "failed";
  }
}

export default async function GCashReturnPage({ searchParams }: Props) {
  const { status, source_id } = await searchParams;

  if (status !== "success" || !source_id) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Payment Cancelled</h1>
        <p className="text-ink-soft mb-8">
          Your GCash payment was cancelled or did not complete.
        </p>
        <Button href="/member/give" variant="outline">
          Back to Give
        </Button>
      </div>
    );
  }

  const result = await confirmGCashPayment(source_id);

  if (result === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Thank You!</h1>
        <p className="text-ink-soft mb-8">
          Your GCash donation was successful. Your generosity helps our
          community thrive.
        </p>
        <Button href="/member/give" variant="outline">
          Back to Give
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-ink mb-4">Payment Issue</h1>
      <p className="text-ink-soft mb-8">
        We could not confirm this payment. Please contact your church admin
        if the amount was charged.
      </p>
      <Link href="/member/give" className="text-primary hover:text-primary-dark">
        Back to Give
      </Link>
    </div>
  );
}
