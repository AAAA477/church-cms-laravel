import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";

/**
 * Streams the CSV export through with the admin's bearer token attached —
 * unlike every other bff/admin/* route this isn't JSON, so it can't go
 * through the generic createAdminProxy() helper (which always parses/
 * re-serializes the response body as JSON).
 */
export async function GET(request: Request) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
  }

  const search = new URL(request.url).search;
  const res = await fetch(`${API}/api/admin/reports/export${search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "text/csv",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment",
    },
  });
}
