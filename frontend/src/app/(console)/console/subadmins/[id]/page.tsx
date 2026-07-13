import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import RoleButtons from "@/components/admin/RoleButtons";
import SubAdminEditForm from "@/components/admin/SubAdminEditForm";
import SubAdminPermissionsPanel from "@/components/admin/SubAdminPermissionsPanel";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminMe, AdminPermissions, AdminSubAdminDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getSubAdmin(id: string): Promise<AdminSubAdminDetail | null> {
  try {
    return await adminFetch<AdminSubAdminDetail>(`/subadmins/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const subadmin = await getSubAdmin(id);
  return { title: subadmin ? `${subadmin.firstname} ${subadmin.lastname ?? ""}`.trim() : "Sub-Admin" };
}

export default async function SubAdminDetailPage({ params }: Props) {
  const { id } = await params;
  const [subadmin, me] = await Promise.all([
    getSubAdmin(id),
    adminFetch<AdminMe>("/me").catch(() => null),
  ]);

  if (!subadmin) notFound();

  // The Laratrust permissions only exist for subadmins — full admins
  // bypass every permission check.
  const permissions =
    subadmin.role === "subadmin"
      ? await adminFetch<AdminPermissions>(`/subadmins/${id}/permissions`).catch(() => null)
      : null;

  const canChangeRole = Boolean(me?.is_admin) && me?.id !== subadmin.id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/subadmins" className="text-sm text-primary hover:text-primary-dark">
        ← Admins &amp; Sub-Admins
      </Link>

      <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
        <h1 className="font-display text-3xl text-ink">
          {subadmin.firstname} {subadmin.lastname}
        </h1>
        <span
          className={
            "inline-block text-xs px-2 py-0.5 rounded-full font-medium " +
            (subadmin.role === "admin" ? "bg-primary text-white" : "bg-warm text-primary")
          }
        >
          {subadmin.role === "admin" ? "Admin" : "Subadmin"}
        </span>
      </div>

      {canChangeRole && (
        <Card className="p-6 mb-6" hover={false}>
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
            Role
          </h2>
          <RoleButtons
            userId={subadmin.id}
            name={`${subadmin.firstname ?? ""} ${subadmin.lastname ?? ""}`.trim() || undefined}
            currentRole={subadmin.role}
            redirectTo={undefined}
          />
        </Card>
      )}

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <SubAdminEditForm subadmin={subadmin} />
      </Card>

      {permissions && (
        <Card className="p-8" hover={false}>
          <h2 className="font-display text-2xl text-ink mb-6">Permissions</h2>
          <SubAdminPermissionsPanel subadminId={subadmin.id} permissions={permissions} />
        </Card>
      )}
    </div>
  );
}
