import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const API = process.env.API_URL ?? "http://localhost:8000";

type RouteParams = { params: Promise<{ path?: string[] }> };

/**
 * Builds the GET/POST/PUT/PATCH/DELETE handlers for a
 * `bff/admin/{resource}/[[...path]]/route.ts` proxy — forwards to Laravel's
 * `/api/admin/{resource}/*` with the admin's bearer token attached
 * server-side, for client-component mutations. List/show pages should call
 * `adminFetch()` directly server-side instead of going through this proxy.
 */
export function createAdminProxy(resource: string) {
  async function forward(request: Request, path: string[] | undefined) {
    const token = (await cookies()).get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const search = new URL(request.url).search;
    const init: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "DELETE") {
      const contentType = request.headers.get("content-type") ?? "application/json";
      init.headers = { ...init.headers, "Content-Type": contentType };
      // Stream the body through as-is (works for both JSON and multipart/
      // form-data file uploads) — Node's fetch requires `duplex: "half"`
      // when the body is a stream.
      init.body = request.body;
      init.duplex = "half";
    }

    const suffix = path && path.length > 0 ? `/${path.join("/")}` : "";
    const res = await fetch(`${API}/api/admin/${resource}${suffix}${search}`, init);
    const data = await res.json().catch(() => ({}));

    // Any successful console mutation invalidates the cached public-site
    // data (guestGet fetches), so changes — theme colors, carousel slides,
    // posts — show up immediately instead of after the revalidate window.
    // { expire: 0 } = hard expiry (read-your-own-writes): the router.refresh
    // after a save must see fresh data, not stale-while-revalidate.
    if (res.ok && request.method !== "GET") {
      revalidateTag("guest", { expire: 0 });
    }

    return NextResponse.json(data, { status: res.status });
  }

  return {
    GET: async (request: Request, { params }: RouteParams) => forward(request, (await params).path),
    POST: async (request: Request, { params }: RouteParams) => forward(request, (await params).path),
    PUT: async (request: Request, { params }: RouteParams) => forward(request, (await params).path),
    PATCH: async (request: Request, { params }: RouteParams) => forward(request, (await params).path),
    DELETE: async (request: Request, { params }: RouteParams) => forward(request, (await params).path),
  };
}
