import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Guards the authenticated member-portal pages. Only checks cookie
 * presence — an expired/invalid token still reaches the page, where
 * memberFetch() throws a 401 that the page turns into a redirect + cookie
 * clear. /member/login and /member/register are intentionally excluded
 * from the matcher — they must stay reachable while signed out.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("member_token")?.value;

  if (!token) {
    const loginUrl = new URL("/member/login", request.url);
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
  ],
};
