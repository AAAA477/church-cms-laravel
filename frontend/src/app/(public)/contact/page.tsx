import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import ContactTabs from "@/components/site/ContactTabs";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with us — send a message, share a prayer request, or ask for help.",
};

export default async function ContactPage() {
  const [church, prayerCategories] = await Promise.all([
    guestGet<ChurchDetails>("/church/details", 600),
    guestGet<{ id: number; name: string }[]>("/prayerCategories", 300).catch(() => []),
  ]);

  return (
    <>
      <PageHeader
        overline="Say Hello"
        title="Contact Us"
        subtitle="We'd love to hear from you — send us a message, share a prayer request, or ask for help."
      />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-3xl text-ink mb-4">
                {church.church_name}
              </h2>
              {church.long_summary && (
                <p className="text-ink-soft leading-relaxed">
                  {church.long_summary}
                </p>
              )}
            </div>

            <dl className="space-y-4 text-sm">
              {church.address && (
                <div>
                  <dt className="font-medium uppercase tracking-wide text-primary mb-1">
                    Address
                  </dt>
                  <dd className="text-ink-soft">{church.address}</dd>
                </div>
              )}
              {church.phone && (
                <div>
                  <dt className="font-medium uppercase tracking-wide text-primary mb-1">
                    Phone
                  </dt>
                  <dd>
                    <a
                      href={`tel:${church.phone}`}
                      className="text-ink-soft hover:text-primary"
                    >
                      {church.phone}
                    </a>
                  </dd>
                </div>
              )}
              {church.email && (
                <div>
                  <dt className="font-medium uppercase tracking-wide text-primary mb-1">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${church.email}`}
                      className="text-ink-soft hover:text-primary"
                    >
                      {church.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="lg:col-span-3 bg-white rounded-sm shadow-sm p-8 sm:p-10">
            <ContactTabs prayerCategories={prayerCategories} />
          </div>
        </div>
      </section>
    </>
  );
}
