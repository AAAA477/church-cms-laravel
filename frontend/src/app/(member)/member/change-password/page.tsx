import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import ChangePasswordForm from "@/components/member/ChangePasswordForm";

export const metadata: Metadata = { title: "Change Password" };

export default function ChangePasswordPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-10">Change Password</h1>
      <Card className="p-8" hover={false}>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
