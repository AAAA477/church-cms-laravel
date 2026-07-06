import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatTile from "@/components/admin/StatTile";
import GenderChart from "@/components/admin/GenderChart";
import OfferingsChart from "@/components/admin/OfferingsChart";
import { adminFetch } from "@/lib/api";
import type { DashboardData } from "@/lib/api-types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const data = await adminFetch<DashboardData>("/dashboard");
  const { stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatTile label="Members" value={stats.members} icon="👥" />
        <StatTile label="Guests" value={stats.guests} icon="🧑‍🤝‍🧑" />
        <StatTile label="Groups" value={stats.groups} icon="⛪" />
        <StatTile label="Events" value={stats.events} icon="📅" />
        <StatTile label="Bulletins" value={stats.bulletins} icon="📰" />
        <StatTile label="Galleries" value={stats.galleries} icon="🖼️" />
        <StatTile label="Pending Prayers" value={stats.pending_prayers} icon="🙏" />
        <StatTile label="Pending Help Requests" value={stats.pending_helps} icon="🆘" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="p-6" hover={false}>
          <h2 className="font-display text-xl text-ink mb-4">Member Gender Split</h2>
          <GenderChart male={stats.male_members} female={stats.female_members} />
        </Card>

        <Card className="p-6 lg:col-span-2" hover={false}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl text-ink">Recent Members</h2>
            <Link href="/console/members" className="text-sm text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          {data.recent_members.length === 0 ? (
            <p className="text-sm text-ink-soft">No members yet.</p>
          ) : (
            <ul className="divide-y divide-warm-deep">
              {data.recent_members.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-ink font-medium">{m.name}</p>
                    <p className="text-xs text-ink-soft">{m.email}</p>
                  </div>
                  {m.city && <span className="text-xs text-ink-soft">{m.city}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card className="p-6" hover={false}>
          <h2 className="font-display text-xl text-ink mb-4">Pending Prayer Requests</h2>
          {data.pending_prayers.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing pending.</p>
          ) : (
            <ul className="space-y-3">
              {data.pending_prayers.map((p) => (
                <li key={p.id} className="text-sm">
                  <p className="text-ink line-clamp-1">{p.text}</p>
                  <p className="text-xs text-ink-soft">{p.name}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6" hover={false}>
          <h2 className="font-display text-xl text-ink mb-4">Pending Help Requests</h2>
          {data.pending_helps.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing pending.</p>
          ) : (
            <ul className="space-y-3">
              {data.pending_helps.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="text-ink">{h.title}</p>
                  <p className="text-xs text-ink-soft">{h.name}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="p-6" hover={false}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl text-ink">Upcoming Events</h2>
            <Link href="/console/events" className="text-sm text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          {data.upcoming_events.length === 0 ? (
            <p className="text-sm text-ink-soft">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcoming_events.map((e) => (
                <li key={e.id} className="text-sm">
                  <Link href={`/console/events/${e.id}`} className="text-ink font-medium hover:text-primary">
                    {e.title}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {e.start_date}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6" hover={false}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl text-ink">Latest Sermons</h2>
            <Link href="/console/sermons" className="text-sm text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          {data.latest_sermons.length === 0 ? (
            <p className="text-sm text-ink-soft">No sermons yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.latest_sermons.map((s) => (
                <li key={s.id} className="text-sm">
                  <Link href={`/console/sermons/${s.id}`} className="text-ink font-medium hover:text-primary">
                    {s.title}
                  </Link>
                  <p className="text-xs text-ink-soft">{s.date}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid gap-6">
          <Card className="p-6" hover={false}>
            <h2 className="font-display text-xl text-ink mb-4">Today&apos;s Birthdays 🎂</h2>
            {data.birthdays.length === 0 ? (
              <p className="text-sm text-ink-soft">No birthdays today.</p>
            ) : (
              <ul className="space-y-2">
                {data.birthdays.map((b) => (
                  <li key={b.id} className="text-sm">
                    <Link href={`/console/members/${b.id}`} className="text-ink hover:text-primary">
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6" hover={false}>
            <h2 className="font-display text-xl text-ink mb-4">Anniversaries 💍</h2>
            {data.anniversaries.length === 0 ? (
              <p className="text-sm text-ink-soft">No anniversaries today.</p>
            ) : (
              <ul className="space-y-2">
                {data.anniversaries.map((a) => (
                  <li key={a.id} className="text-sm">
                    <Link href={`/console/members/${a.id}`} className="text-ink hover:text-primary">
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-6" hover={false}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Offerings by Month</h2>
          <p className="text-sm text-ink-soft">
            Total: ${Number(stats.total_fund ?? 0).toLocaleString()}
          </p>
        </div>
        <OfferingsChart data={data.offerings_chart} />
      </Card>
    </div>
  );
}
