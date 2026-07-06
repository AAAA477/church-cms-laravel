import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Google Analytics" };

type AnalyticsData = {
  configured: boolean;
  mostVisitedPages: { url?: string; pageTitle?: string; pageViews?: number }[];
  pageViews: { date?: string; visitors?: number; pageViews?: number }[];
  referrers: { url?: string; pageViews?: number }[];
  userTypes: { type?: string; sessions?: number }[];
  browsers: { browser?: string; sessions?: number }[];
};

function StatTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <Card className="p-6" hover={false}>
      <h2 className="font-display text-xl text-ink mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-soft">No data.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-soft border-b border-warm-deep">
                {headers.map((h) => (
                  <th key={h} className="py-2 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-warm-deep/50 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 pr-4 text-ink">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default async function GoogleAnalyticsPage() {
  const data = await adminFetch<AnalyticsData>("/analytics");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Google Analytics</h1>
      <p className="text-sm text-ink-soft mb-8">Site traffic for the last 7 days.</p>

      {!data.configured && (
        <Card className="p-8 mb-6 border-l-4 border-amber-500" hover={false}>
          <p className="text-sm text-ink">
            Google Analytics isn&apos;t configured. Set the <code className="text-xs bg-warm px-1 py-0.5 rounded">ANALYTICS_PROPERTY_ID</code>{" "}
            and service-account credentials in the server environment to see traffic data here.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <StatTable
          title="Visitors & Page Views"
          headers={["Date", "Visitors", "Page Views"]}
          rows={data.pageViews.map((r) => [r.date ?? "—", r.visitors ?? 0, r.pageViews ?? 0])}
        />
        <StatTable
          title="Most Visited Pages"
          headers={["Page", "Views"]}
          rows={data.mostVisitedPages.map((r) => [r.pageTitle ?? r.url ?? "—", r.pageViews ?? 0])}
        />
        <StatTable
          title="Top Referrers"
          headers={["Referrer", "Views"]}
          rows={data.referrers.map((r) => [r.url ?? "—", r.pageViews ?? 0])}
        />
        <StatTable
          title="User Types"
          headers={["Type", "Sessions"]}
          rows={data.userTypes.map((r) => [r.type ?? "—", r.sessions ?? 0])}
        />
        <StatTable
          title="Top Browsers"
          headers={["Browser", "Sessions"]}
          rows={data.browsers.map((r) => [r.browser ?? "—", r.sessions ?? 0])}
        />
      </div>
    </div>
  );
}
