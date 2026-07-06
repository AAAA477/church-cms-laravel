import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";

/** Anonymous — mirrors legacy `toggleLike`, which was session-only, no real identity. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();

  const res = await fetch(`${API}/api/v2/post/${CHURCH}/${id}/like`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
