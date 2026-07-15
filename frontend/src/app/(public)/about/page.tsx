import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import AboutCarousel from "@/components/site/AboutCarousel";
import Button from "@/components/ui/Button";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, what we believe, and what brings us together.",
};

export default async function AboutPage() {
  const church = await guestGet<ChurchDetails>("/church/details", 600);
  const hasCarousel = church.about_carousel.length > 0;

  return (
    <>
      <PageHeader
        overline="Who We Are"
        title={`About ${church.church_name}`}
        subtitle={church.short_summary || undefined}
      />

      {hasCarousel && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AboutCarousel slides={church.about_carousel} />
          </div>
        </section>
      )}

      {church.quotes && (
        <section className="bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <p className="font-display text-2xl sm:text-3xl italic leading-relaxed">
              “{church.quotes}”
            </p>
          </div>
        </section>
      )}

      {church.long_summary && (
        <section className={`py-24 ${hasCarousel ? "bg-warm" : ""}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-6 h-[3px] w-[60px] bg-primary" aria-hidden />
            <p className="font-display text-xl sm:text-2xl text-ink leading-relaxed whitespace-pre-line">
              {church.long_summary}
            </p>
          </div>
        </section>
      )}

      <section className="py-20 bg-warm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="ornament font-display text-3xl text-ink mb-4">
            Come As You Are
          </h2>
          <p className="text-ink-soft leading-relaxed mb-8">
            We&apos;d love to have you join us — see what&apos;s coming up, or reach out with any questions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/events">Upcoming Events</Button>
            <Button href="/contact" variant="outline">
              Get In Touch
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
