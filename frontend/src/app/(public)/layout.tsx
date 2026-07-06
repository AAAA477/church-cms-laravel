import { cookies } from "next/headers";
import NavBar, { type NavMember } from "@/components/site/NavBar";
import Footer from "@/components/site/Footer";
import { guestGet, memberFetch } from "@/lib/api";
import type { ChurchDetails, MemberProfile } from "@/lib/api-types";

/**
 * Signed-in visitor summary for the nav's avatar dropdown (mirrors the
 * legacy theme, which had the full auth user available in every view).
 * Falls back to the cookie name if the profile call fails; null when
 * signed out.
 */
async function getNavMember(): Promise<NavMember | null> {
  const cookieStore = await cookies();
  if (!cookieStore.get("member_token")?.value) return null;

  const cookieName = cookieStore.get("member_name")?.value ?? "Member";

  try {
    const res = await memberFetch<{ data: MemberProfile[] }>("/member/show");
    const p = res.data[0];
    if (!p) return { name: cookieName, email: null, avatar: null, isGuest: false };
    return {
      name: `${p.firstname} ${p.lastname}`.trim() || cookieName,
      email: p.email_id ?? null,
      avatar: p.avatar || null,
      isGuest: p.membership_type === "guest",
    };
  } catch {
    // Expired/invalid token or API hiccup — show the basic signed-in
    // state; guarded member pages do their own 401 handling.
    return { name: cookieName, email: null, avatar: null, isGuest: false };
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [church, member] = await Promise.all([
    guestGet<ChurchDetails>("/church/details", 600),
    getNavMember(),
  ]);

  return (
    <>
      <NavBar
        churchName={church.church_name}
        tagline="Faith • Hope • Love"
        member={member}
      />
      <main className="flex-1">{children}</main>
      <Footer church={church} isSignedIn={Boolean(member)} />
    </>
  );
}
