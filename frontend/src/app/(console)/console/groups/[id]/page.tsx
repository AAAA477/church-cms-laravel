import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import GroupEditForm from "@/components/admin/GroupEditForm";
import GroupMembersPanel from "@/components/admin/GroupMembersPanel";
import GroupMessagesPanel, { type GroupMessage } from "@/components/admin/GroupMessagesPanel";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminGroupCategory, AdminGroupDetail, AdminGroupMember } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getGroup(id: string): Promise<AdminGroupDetail | null> {
  try {
    return await adminFetch<AdminGroupDetail>(`/groups/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const group = await getGroup(id);
  return { title: group?.name ?? "Group" };
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const group = await getGroup(id);

  if (!group) notFound();

  const [categories, membersPage, messagesPage] = await Promise.all([
    adminFetch<AdminGroupCategory[]>("/group-categories"),
    adminFetch<{ data: AdminGroupMember[] }>(`/groups/${id}/members`),
    adminFetch<{ data: GroupMessage[] }>(`/groups/${id}/messages`),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/groups" className="text-sm text-primary hover:text-primary-dark">
        ← Groups
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">{group.name}</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <GroupEditForm group={group} categories={categories} />
      </Card>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Members</h2>
        <GroupMembersPanel groupId={group.id} members={membersPage.data} />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Group Messages</h2>
        <GroupMessagesPanel groupId={group.id} messages={messagesPage.data} />
      </Card>
    </div>
  );
}
