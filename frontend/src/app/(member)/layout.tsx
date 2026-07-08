import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NavBar, { type NavMember } from "@/components/site/NavBar";
import Footer from "@/components/site/Footer";
import { memberFetch, guestGet, ApiError } from "@/lib/api";
import type { ChurchDetails, MemberProfile } from "@/lib/api-types";

/**
 * Member pages render inside the SAME chrome as the public site (NavBar
 * with the avatar dropdown + Footer), matching the legacy theme where a
 * signed-in member never left the main website. The only difference from
 * the public layout is the auth guard: an expired/invalid token redirects
 * to login instead of silently showing the signed-out state.
 */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieName = cookieStore.get("member_name")?.value ?? "Member";

  const church = await guestGet<ChurchDetails>("/church/details", 60).catch(
    () => ({ church_name: "Church" }) as ChurchDetails,
  );

  let member: NavMember = { name: cookieName, email: null, avatar: null, isGuest: false };

  try {
    const res = await memberFetch<{ data: MemberProfile[] }>("/member/show");
    const p = res.data[0];
    if (p) {
      member = {
        name: `${p.firstname} ${p.lastname}`.trim() || cookieName,
        email: p.email_id ?? null,
        avatar: p.avatar || null,
        isGuest: p.membership_type === "guest",
      };
    }
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
      <NavBar churchName={church.church_name} tagline="Faith • Hope • Love" member={member} />
      <main className="flex-1 bg-warm min-h-screen">{children}</main>
      <Footer church={church} isSignedIn />
    </>
  );
}
