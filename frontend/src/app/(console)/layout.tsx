import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { adminFetch, guestGet, ApiError } from "@/lib/api";
import type { AdminMe, ChurchDetails } from "@/lib/api-types";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieName = cookieStore.get("admin_name")?.value;

  let name = cookieName ?? "Admin";

  // Uncached: an admin who renames the church in Settings should see the
  // sidebar update on the next page load, not after a revalidate window.
  const church = await guestGet<ChurchDetails>("/church/details", 0).catch(
    () => ({ church_name: "Church", church_logo: null }) as ChurchDetails,
  );

  try {
    const me = await adminFetch<AdminMe>("/me");
    name = me.name;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      // Fallback for a present-but-expired/invalid token — proxy.ts only
      // checks cookie presence, so an expired token reaches this far.
      redirect("/console/login?next=/console");
    }
    // Non-auth errors: keep the cookie-derived name, page content will
    // surface its own error state.
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav name={name} churchName={church.church_name} churchLogo={church.church_logo} />
      <main className="flex-1 bg-warm min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
}
