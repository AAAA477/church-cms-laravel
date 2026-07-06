import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Guards /member/*. Only checks cookie presence — an expired/invalid token
 * still reaches the page, where memberFetch() throws a 401 that the page
 * turns into a redirect + cookie clear.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("member_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*"],
};
