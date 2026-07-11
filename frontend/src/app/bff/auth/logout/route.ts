import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("member_token")?.value;
  const adminToken = cookieStore.get("admin_token")?.value;

  if (token) {
    await fetch(`${API}/api/member/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  // Admins signed in via the public site also hold a console session
  // (set by the login route) — signing out ends both.
  if (adminToken) {
    await fetch(`${API}/api/admin/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${adminToken}` },
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("member_token");
  response.cookies.delete("member_name");
  response.cookies.delete("admin_token");
  response.cookies.delete("admin_name");
  return response;
}
