import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${API}/api/guest/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...body, church_id: CHURCH }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
