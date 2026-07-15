import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";
const isProd = process.env.NODE_ENV === "production";

/**
 * Mints an admin_token cookie for the current member session, when that
 * account is (now) an admin/subadmin — without asking for the password
 * again. Needed because promoting someone doesn't retroactively touch an
 * already-open member session (admin_token is normally only set at login
 * time); the "Admin Console" nav link calls this first so it works on the
 * first click regardless of whether the promotion happened before or
 * after the visitor signed in. See MemberAuthController@upgradeToAdmin.
 */
export async function POST() {
  const cookieStore = await cookies();
  const memberToken = cookieStore.get("member_token")?.value;

  if (!memberToken) {
    return NextResponse.json({ message: "Not signed in" }, { status: 401 });
  }

  const res = await fetch(`${API}/api/member/upgrade-admin`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${memberToken}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    return NextResponse.json(
      { message: data.message ?? "Could not open the admin console" },
      { status: res.status === 403 ? 403 : 400 },
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_token", data.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("admin_name", data.user.name, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
