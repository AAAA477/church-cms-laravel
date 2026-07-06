import type { Metadata } from "next";
import { cookies } from "next/headers";
import Card from "@/components/ui/Card";
import { memberFetch } from "@/lib/api";
import type { MemberProfile } from "@/lib/api-types";

export const metadata: Metadata = { title: "Profile" };

const fields: [string, keyof MemberProfile][] = [
  ["First Name", "firstname"],
  ["Last Name", "lastname"],
  ["Email", "email_id"],
  ["Mobile", "mobile_no"],
  ["Gender", "gender"],
  ["Date of Birth", "date_of_birth"],
  ["Profession", "profession"],
  ["Marital Status", "marriage_status"],
  ["Address", "address"],
  ["City", "city_name"],
  ["State", "state_name"],
  ["Country", "country_name"],
  ["Membership Type", "membership_type"],
  ["Member Since", "membership_start_date"],
];

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_id")?.value ?? "0";

  const res = await memberFetch<{ data: MemberProfile[] }>(
    `/member/show/${memberId}`,
  );
  const profile = res.data[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-ink mb-10">My Profile</h1>

      <Card className="p-8" hover={false}>
        <dl className="grid gap-6 sm:grid-cols-2">
          {fields.map(([label, key]) => (
            <div key={key}>
              <dt className="text-xs font-medium uppercase tracking-wide text-primary mb-1">
                {label}
              </dt>
              <dd className="text-ink">{profile?.[key] || "—"}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm text-ink-soft">
          To update your details, please contact your church admin — editing
          from the portal is coming soon.
        </p>
      </Card>
    </div>
  );
}
