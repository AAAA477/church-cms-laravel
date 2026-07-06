import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("member_token")?.value;

  if (token) {
    await fetch(`${API}/api/member/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("member_token");
  response.cookies.delete("member_name");
  response.cookies.delete("member_id");
  return response;
}
