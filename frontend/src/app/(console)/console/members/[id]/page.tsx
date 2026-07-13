import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import MemberEditForm from "@/components/admin/MemberEditForm";
import PersonStatusActions from "@/components/admin/PersonStatusActions";
import RoleButtons from "@/components/admin/RoleButtons";
import { adminFetch, ApiError } from "@/lib/api";
import type { AdminMemberDetail } from "@/lib/api-types";

type Props = { params: Promise<{ id: string }> };

async function getMember(id: string): Promise<AdminMemberDetail | null> {
  try {
    return await adminFetch<AdminMemberDetail>(`/members/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  return { title: member ? `${member.firstname} ${member.lastname ?? ""}`.trim() : "Member" };
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const [member, me] = await Promise.all([
    getMember(id),
    adminFetch<{ id: number; is_admin: boolean }>("/me").catch(() => null),
  ]);

  if (!member) notFound();

  // Role controls: full admins only, and never for your own account.
  const canChangeRole = Boolean(me?.is_admin) && me?.id !== member.id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/members" className="text-sm text-primary hover:text-primary-dark">
        ← Members
      </Link>

      <div className="flex flex-wrap items-center gap-4 mt-4 mb-8">
        {member.avatar && (
          <Image
            src={member.avatar}
            alt={member.firstname ?? "Member"}
            width={64}
            height={64}
            className="rounded-full object-cover border-2 border-warm"
          />
        )}
        <div>
          <h1 className="font-display text-3xl text-ink">
            {member.firstname} {member.lastname}
          </h1>
          <p className="text-sm text-ink-soft">{member.email ?? member.mobile_no}</p>
        </div>
      </div>

      <Card className="p-6 mb-6" hover={false}>
        <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
          Status
        </h2>
        <PersonStatusActions resource="members" personId={member.id} currentStatus={member.status} />
      </Card>

      {canChangeRole && (
        <Card className="p-6 mb-6" hover={false}>
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
            Role
          </h2>
          <p className="text-xs text-ink-soft mb-3">
            Promote this member to church staff — they appear under Users → Subadmins and can sign in to this console.
          </p>
          <RoleButtons
            userId={member.id}
            name={`${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() || undefined}
            currentRole="member"
            redirectTo="/console/subadmins"
          />
        </Card>
      )}

      <Card className="p-8" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Edit Details</h2>
        <MemberEditForm member={member} />
      </Card>
    </div>
  );
}
