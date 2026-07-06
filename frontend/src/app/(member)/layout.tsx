import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MemberNav from "@/components/member/MemberNav";
import { memberFetch, ApiError } from "@/lib/api";
import type { MemberProfile } from "@/lib/api-types";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieName = cookieStore.get("member_name")?.value;

  let name = cookieName ?? "Member";

  try {
    const res = await memberFetch<{ data: MemberProfile[] }>("/member/show");
    const profile = res.data[0];
    if (profile) name = `${profile.firstname} ${profile.lastname}`.trim();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      // Fallback for a present-but-expired/invalid token — proxy.ts only
      // checks cookie presence, so an expired token reaches this far.
      redirect("/member/login?next=/member");
    }
    // Non-auth errors: keep the cookie-derived name, page content will
    // surface its own error state.
  }

  return (
    <>
      <MemberNav name={name} />
      <main className="flex-1 bg-warm min-h-screen">{children}</main>
    </>
  );
}
