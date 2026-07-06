import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { guestGet } from "@/lib/api";

export const metadata: Metadata = {
  title: "Help Requests",
  description: "Community members who need a helping hand.",
};

type Help = {
  id: number;
  requested_person: string;
  title: string;
  description: string;
  contact_details: string;
  status: string;
  display_status: string;
  expires_at: string;
};

export default async function HelpRequestsPage() {
  const helps = await guestGet<{ data: Help[] }>("/helps");

  const approved = helps.data.filter((h) => h.status === "approve");

  return (
    <>
      <PageHeader
        overline="Serve One Another"
        title="Help Requests"
        subtitle="Members of our community who could use a helping hand. Reach out directly if you can help."
      />
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {approved.length === 0 ? (
            <EmptyState
              title="No open help requests"
              message="Requests for help from our community will appear here."
              ctaLabel="Back to Home"
              ctaHref="/"
            />
          ) : (
            <ul className="space-y-6">
              {approved.map((help) => (
                <li
                  key={help.id}
                  className="bg-white rounded-sm shadow-sm p-8 card-hover"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h2 className="font-display text-2xl text-ink">
                      {help.title}
                    </h2>
                    <span className="text-xs text-ink-soft">
                      open until {help.expires_at}
                    </span>
                  </div>
                  <p className="text-ink-soft leading-relaxed mb-4">
                    {help.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-ink-soft">
                      requested by{" "}
                      <span className="text-ink">{help.requested_person}</span>
                    </span>
                    {help.contact_details && (
                      <a
                        href={
                          help.contact_details.includes("@")
                            ? `mailto:${help.contact_details}`
                            : `tel:${help.contact_details}`
                        }
                        className="font-medium uppercase tracking-wider text-primary hover:text-primary-dark"
                      >
                        Offer Help
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
