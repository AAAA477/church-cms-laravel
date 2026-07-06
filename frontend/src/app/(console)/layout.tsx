import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminMe } from "@/lib/api-types";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieName = cookieStore.get("admin_name")?.value;

  let name = cookieName ?? "Admin";

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
      <AdminNav name={name} />
      <main className="flex-1 bg-warm min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
}
