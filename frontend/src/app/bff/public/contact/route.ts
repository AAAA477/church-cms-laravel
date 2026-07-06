import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:8000";
const CHURCH = process.env.CHURCH_ID ?? "1";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${API}/api/v2/add/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      church_id: CHURCH,
      fullname: body.fullname,
      email: body.email,
      mobile: body.mobile,
      query_message: body.query_message,
    }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
