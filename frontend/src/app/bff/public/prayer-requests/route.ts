import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";

/**
 * Submitting a prayer request requires a signed-in member — mirrors the
 * legacy site's `webguest` middleware, which also required at least a
 * lightweight guest account, never fully anonymous submission.
 */
export async function POST(request: Request) {
  const token = (await cookies()).get("member_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.text();

  const res = await fetch(`${API}/api/v2/prayerRequests/${CHURCH}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
