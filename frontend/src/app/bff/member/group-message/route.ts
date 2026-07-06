import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const token = (await cookies()).get("member_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { groupId, message } = await request.json();

  const res = await fetch(`${API}/api/v1/group/sendmessage/${groupId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
