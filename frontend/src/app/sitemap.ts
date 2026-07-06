import type { MetadataRoute } from "next";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";
const SITE = process.env.SITE_URL ?? process.env.DEPLOY_PRIME_URL ?? process.env.URL ?? "http://localhost:3000";

async function ids(path: string, key = "id"): Promise<number[]> {
  try {
    const res = await fetch(`${API}/api/v2/${path}/${CHURCH}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    const rows: Record<string, unknown>[] = body.data ?? [];
    return rows.map((r) => Number(r[key])).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sermons, events, posts, galleries] = await Promise.all([
    ids("sermons", "sermon_id"),
    ids("events"),
    ids("posts"),
    ids("galleries"),
  ]);

  const statics = [
    "",
    "/sermons",
    "/events",
    "/blog",
    "/gallery",
    "/bulletins",
    "/prayer-board",
    "/help-requests",
    "/faq",
    "/contact",
  ].map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: "weekly" as const,
  }));

  return [
    ...statics,
    ...sermons.map((id) => ({ url: `${SITE}/sermons/${id}` })),
    ...events.map((id) => ({ url: `${SITE}/events/${id}` })),
    ...posts.map((id) => ({ url: `${SITE}/blog/${id}` })),
    ...galleries.map((id) => ({ url: `${SITE}/gallery/${id}` })),
  ];
}
