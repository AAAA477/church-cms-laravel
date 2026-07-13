import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:8000";

type RouteParams = { params: Promise<{ path: string[] }> };

/**
 * Read-only proxy for the registration form's cascading address selects:
 * /bff/public/geo/countries | states/{countryId} | cities/{stateId}
 * (client components can't reach API_URL directly — it's server-side only).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { path } = await params;
  const suffix = path.join("/");

  if (!/^(countries|states\/\d+|cities\/\d+)$/.test(suffix)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const res = await fetch(`${API}/api/geo/${suffix}`, {
    headers: { Accept: "application/json" },
    // Geography data almost never changes — cache aggressively.
    next: { revalidate: 86400 },
  });

  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}
