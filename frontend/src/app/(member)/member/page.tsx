import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { memberFetch } from "@/lib/api";
import type { MemberEvent, MemberGroup, MemberProfile } from "@/lib/api-types";

export const metadata: Metadata = { title: "Dashboard" };

const quickLinks = [
  { href: "/member/give", label: "Give", icon: "💝" },
  { href: "/member/groups", label: "My Groups", icon: "👥" },
  { href: "/member/profile", label: "Profile", icon: "👤" },
  { href: "/member/id-card", label: "ID Card", icon: "🪪" },
];

export default async function MemberDashboard() {
  const [profileRes, groupsRes, eventsRes] = await Promise.allSettled([
    memberFetch<{ data: MemberProfile[] }>("/member/show"),
    memberFetch<{ data: MemberGroup[] }>("/groups/list"),
    memberFetch<{ data: MemberEvent[] }>("/events/upcoming"),
  ]);

  const profile =
    profileRes.status === "fulfilled" ? profileRes.value.data[0] : undefined;
  const groups = groupsRes.status === "fulfilled" ? groupsRes.value.data : [];
  const events = eventsRes.status === "fulfilled" ? eventsRes.value.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-2">
        Welcome back{profile ? `, ${profile.firstname}` : ""}
      </h1>
      <p className="text-ink-soft mb-10">
        Here&apos;s what&apos;s happening in your community.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-sm shadow-sm p-6 text-center card-hover"
          >
            <span className="text-3xl block mb-2" aria-hidden>
              {link.icon}
            </span>
            <span className="text-sm font-medium uppercase tracking-wide text-ink">
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-ink">Upcoming Events</h2>
            <Link href="/events" className="text-sm text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          {events.length === 0 ? (
            <Card className="p-6 text-sm text-ink-soft">
              No upcoming events right now.
            </Card>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <Card key={event.event_id} className="p-5">
                  <p className="text-xs uppercase tracking-wide text-primary mb-1">
                    {event.start_date}
                  </p>
                  <p className="font-display text-xl text-ink">{event.title}</p>
                  {event.location && (
                    <p className="text-sm text-ink-soft mt-1">{event.location}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-ink">My Groups</h2>
            <Link href="/member/groups" className="text-sm text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          {groups.length === 0 ? (
            <Card className="p-6 text-sm text-ink-soft">
              You haven&apos;t joined any groups yet.
            </Card>
          ) : (
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <Link key={group.group_id} href={`/member/groups/${group.group_id}`}>
                  <Card className="p-5">
                    <p className="text-xs uppercase tracking-wide text-primary mb-1">
                      {group.group_category}
                    </p>
                    <p className="font-display text-xl text-ink">
                      {group.group_name}
                    </p>
                    <p className="text-sm text-ink-soft mt-1 line-clamp-1">
                      {group.group_description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
