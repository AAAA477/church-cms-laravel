import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import SubAdminEditForm from "@/components/admin/SubAdminEditForm";
import SubAdminPermissionsPanel from "@/components/admin/SubAdminPermissionsPanel";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminPermissions, AdminSubAdminDetail } from "@/lib/api-types";

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
  const subadmin = await getSubAdmin(id);

  if (!subadmin) notFound();

  const permissions = await adminFetch<AdminPermissions>(`/subadmins/${id}/permissions`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/subadmins" className="text-sm text-primary hover:text-primary-dark">
        ← Sub-Admins
      </Link>

      <h1 className="font-display text-3xl text-ink mt-4 mb-8">
        {subadmin.firstname} {subadmin.lastname}
      </h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <SubAdminEditForm subadmin={subadmin} />
      </Card>

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Permissions</h2>
        <SubAdminPermissionsPanel subadminId={subadmin.id} permissions={permissions} />
      </Card>
    </div>
  );
}
