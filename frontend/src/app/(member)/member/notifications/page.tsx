import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import NotificationList from "@/components/member/NotificationList";
import { memberFetch } from "@/lib/api";
import type { Notification } from "@/lib/api-types";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const res = await memberFetch<{ data: Notification[]; unread_count: number }>(
    "/notifications",
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-10">Notifications</h1>
      <Card className="p-6" hover={false}>
        <NotificationList notifications={res.data} unreadCount={res.unread_count} />
      </Card>
    </div>
  );
}
