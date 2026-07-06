import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Guards the authenticated member-portal AND admin-console pages. Only
 * checks cookie presence — an expired/invalid token still reaches the
 * page, where memberFetch()/adminFetch() throws a 401 that the page turns
 * into a redirect + cookie clear. /member/login, /member/register, and
 * /console/login are intentionally excluded from the matcher — they must
 * stay reachable while signed out.
 */
export function proxy(request: NextRequest) {
  const isConsole = request.nextUrl.pathname.startsWith("/console");
  const cookieName = isConsole ? "admin_token" : "member_token";
  const loginPath = isConsole ? "/console/login" : "/member/login";

  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/member",
    "/member/groups/:path*",
    "/member/give/:path*",
    "/member/id-card",
    "/member/notifications",
    "/member/profile",
    "/member/change-password",
    "/console",
    "/console/members/:path*",
    "/console/guests/:path*",
    "/console/groups/:path*",
    "/console/subadmins/:path*",
    "/console/events/:path*",
    "/console/sermons/:path*",
    "/console/bulletins/:path*",
    "/console/gallery/:path*",
    "/console/quotes/:path*",
    "/console/prayer-board/:path*",
    "/console/helps/:path*",
    "/console/feedbacks/:path*",
    "/console/contacts/:path*",
    "/console/funds/:path*",
    "/console/donations/:path*",
    "/console/payaccounts/:path*",
    "/console/messages/:path*",
    "/console/campaigns/:path*",
    "/console/mailing-lists/:path*",
    "/console/subscribers/:path*",
    "/console/pages/:path*",
    "/console/posts/:path*",
    "/console/faq/:path*",
    "/console/widgets/:path*",
    "/console/reports/:path*",
    "/console/activity-log/:path*",
    "/console/settings/:path*",
    "/console/profile/:path*",
  ],
};
