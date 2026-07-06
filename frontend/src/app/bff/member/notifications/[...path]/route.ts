import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";

/** Proxies /api/member/notifications/* to Laravel's /api/v1/notification(s)/*. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const token = (await cookies()).get("member_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { path } = await params;
  const res = await fetch(`${API}/api/v1/notification/${path.join("/")}`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
