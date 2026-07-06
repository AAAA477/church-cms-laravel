import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:8000";
const isProd = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const res = await fetch(`${API}/api/member/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    return NextResponse.json(
      { message: data.message ?? "Invalid email or password" },
      { status: res.status === 401 || res.status === 403 ? res.status : 400 },
    );
  }

  const response = NextResponse.json({ success: true, user: data.user });

  response.cookies.set("member_token", data.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Non-httpOnly, display-only — never used for auth.
  response.cookies.set("member_name", data.user.name, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
