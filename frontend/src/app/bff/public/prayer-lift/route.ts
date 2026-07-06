import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";

export async function POST(request: Request) {
  const { prayerId } = await request.json();

  if (!prayerId) {
    return NextResponse.json(
      { success: false, error: "prayerId required" },
      { status: 400 },
    );
  }

  const res = await fetch(
    `${API}/api/v2/prayerRequests/${CHURCH}/${prayerId}/lift`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        // Forward the visitor's identity so Laravel's guest dedup hash
        // (ip|user-agent|prayer) distinguishes visitors, not this server.
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
        "User-Agent": request.headers.get("user-agent") ?? "",
      },
    },
  );

  const data = await res.json().catch(() => ({ success: false }));
  return NextResponse.json(data, { status: res.status });
}
