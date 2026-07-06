import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { memberFetch } from "@/lib/api";
import type { MemberGroup } from "@/lib/api-types";

export const metadata: Metadata = { title: "My Groups" };

export default async function MemberGroupsPage() {
  const groups = await memberFetch<{ data: MemberGroup[] }>("/groups/list");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-10">My Groups</h1>

      {groups.data.length === 0 ? (
        <EmptyState
          title="No groups yet"
          message="You haven't joined any groups. Speak to your church admin to get connected."
          ctaLabel="Back to Dashboard"
          ctaHref="/member"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.data.map((group) => (
            <Link key={group.group_id} href={`/member/groups/${group.group_id}`}>
              <Card className="p-6 h-full">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
                  {group.group_category}
                </p>
                <h2 className="font-display text-2xl text-ink mb-2">
                  {group.group_name}
                </h2>
                <p className="text-sm text-ink-soft line-clamp-2 mb-4">
                  {group.group_description}
                </p>
                <p className="text-xs text-ink-soft">
                  Since {group.started} · {group.role}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
