import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import AvatarUploadForm from "@/components/admin/AvatarUploadForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">My Profile</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Avatar</h2>
        <AvatarUploadForm />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Change Password</h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
