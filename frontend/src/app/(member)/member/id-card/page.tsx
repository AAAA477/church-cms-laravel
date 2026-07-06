import type { Metadata } from "next";
import Image from "next/image";
import Card from "@/components/ui/Card";
import PrintButton from "@/components/member/PrintButton";
import { memberFetch } from "@/lib/api";
import type { IdCard } from "@/lib/api-types";

export const metadata: Metadata = { title: "ID Card" };

export default async function IdCardPage() {
  const card = await memberFetch<IdCard>("/member/idcard");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:py-0">
      <h1 className="font-display text-4xl text-ink mb-8 print:hidden">
        Membership ID Card
      </h1>

      <Card
        className="p-8 print:shadow-none print:border print:border-ink/20"
        hover={false}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {card.church_logo && (
              <Image
                src={card.church_logo}
                alt={card.church_name ?? "Church"}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-display text-xl text-primary leading-tight">
                {card.church_name}
              </p>
              <p className="text-xs text-ink-soft">{card.membership_year}</p>
            </div>
          </div>
          {card.avatar && (
            <Image
              src={card.avatar}
              alt={card.name}
              width={72}
              height={72}
              className="rounded-sm object-cover border-2 border-warm"
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center">
          <dl className="space-y-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-primary">
                Name
              </dt>
              <dd className="text-ink font-medium">{card.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-primary">
                Member ID
              </dt>
              <dd className="text-ink">#{card.member_id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-primary">
                Phone
              </dt>
              <dd className="text-ink">{card.phone}</dd>
            </div>
            {card.address && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-primary">
                  Address
                </dt>
                <dd className="text-ink text-sm">{card.address}</dd>
              </div>
            )}
          </dl>

          {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, not optimizable by next/image */}
          <img
            src={card.qr_code}
            alt="Check-in QR code"
            width={120}
            height={120}
            className="shrink-0 justify-self-center"
          />
        </div>
      </Card>

      <div className="mt-8 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
