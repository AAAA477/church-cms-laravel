import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";

/**
 * Proxies /api/member/donate/* to Laravel's /api/v1/donate/* with the
 * member's bearer token attached server-side. One handler covers gateways,
 * history, status/{id}, store, verify, mpesa-stk, gcash-init, gcash-confirm
 * and stripe-intent, since they all need the same auth + forwarding.
 */
async function forward(request: Request, path: string[] | undefined) {
  const token = (await cookies()).get("member_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const search = new URL(request.url).search;
  const init: RequestInit = {
    method: request.method,
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  };

  if (request.method !== "GET") {
    init.headers = { ...init.headers, "Content-Type": "application/json" };
    init.body = await request.text();
  }

  const suffix = path && path.length > 0 ? `/${path.join("/")}` : "";
  const res = await fetch(`${API}/api/v1/donate${suffix}${search}`, init);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return forward(request, (await params).path);
}

export async function POST(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return forward(request, (await params).path);
}
