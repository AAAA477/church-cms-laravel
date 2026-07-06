import "server-only";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * GET a public /api/v2 endpoint. `path` is appended after the church id
 * unless it contains `{church}`, e.g. guestGet("/sermons") →
 * GET {API}/api/v2/sermons/{CHURCH}.
 */
export async function guestGet<T>(path: string, revalidate = 300): Promise<T> {
  const url = path.includes("{church}")
    ? `${API}/api/v2${path.replace("{church}", CHURCH)}`
    : `${API}/api/v2${path}/${CHURCH}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `GET ${url} → ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetch an authenticated /api/v1 member endpoint using the bearer token
 * stored in the httpOnly `member_token` cookie. Never cached.
 */
export async function memberFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = (await cookies()).get("member_token")?.value;

  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  const res = await fetch(`${API}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${init.method ?? "GET"} ${path} → ${res.status}`);
  }

  return res.json() as Promise<T>;
}
