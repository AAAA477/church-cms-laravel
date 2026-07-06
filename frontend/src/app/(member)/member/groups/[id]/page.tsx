import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import GroupMessageForm from "@/components/member/GroupMessageForm";
import { memberFetch, ApiError } from "@/lib/api";
import type { GroupPostItem, MemberGroup, Paginated } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getGroup(id: string): Promise<MemberGroup | undefined> {
  const groups = await memberFetch<{ data: MemberGroup[] }>("/groups/list");
  return groups.data.find((g) => String(g.group_id) === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const group = await getGroup(id);
  return { title: group?.group_name ?? "Group" };
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;

  const [group, posts] = await Promise.all([
    getGroup(id),
    memberFetch<Paginated<GroupPostItem>>(`/grouppost/list/${id}`).catch((e) => {
      if (e instanceof ApiError) return { data: [], links: {} as never, meta: {} as never };
      throw e;
    }),
  ]);

  if (!group) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/member/groups" className="text-sm text-primary hover:text-primary-dark">
        ← My Groups
      </Link>

      <div className="mt-4 mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
          {group.group_category}
        </p>
        <h1 className="font-display text-4xl text-ink mb-3">{group.group_name}</h1>
        <p className="text-ink-soft">{group.group_description}</p>
        {group.group_members.length > 0 && (
          <p className="mt-3 text-sm text-ink-soft">
            With {group.group_members.slice(0, 5).join(", ")}
            {group.group_members.length > 5 &&
              ` and ${group.group_members.length - 5} others`}
          </p>
        )}
      </div>

      <Card className="p-6 mb-8" hover={false}>
        <GroupMessageForm groupId={group.group_id} />
      </Card>

      <div className="space-y-4">
        {posts.data.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No posts yet — be the first to share something.
          </p>
        ) : (
          posts.data.map((post) => (
            <Card key={post.id} className="p-6" hover={false}>
              <p className="text-ink whitespace-pre-line">{post.message}</p>
              <p className="mt-3 text-xs text-ink-soft">{post.created_at}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
