import type { Metadata } from "next";
import Card from "@/components/ui/Card";

export const metadata: Metadata = { title: "ID Card" };

export default function IdCardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-6">ID Card</h1>
      <Card className="p-8 text-center" hover={false}>
        <p className="text-ink-soft">
          Your printable membership card is coming soon.
        </p>
      </Card>
    </div>
  );
}
