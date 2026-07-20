import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import AboutCarousel from "@/components/site/AboutCarousel";
import TenetsList from "@/components/site/TenetsList";
import Button from "@/components/ui/Button";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";
import { TENETS, TENETS_INTRO, TENETS_OUTRO } from "@/lib/tenets";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, what we believe, and what brings us together.",
};

export default async function AboutPage() {
  const church = await guestGet<ChurchDetails>("/church/details", 600);
  const hasCarousel = church.about_carousel.length > 0;

  // Admin-set tenets (Settings > About > Our Tenets) win when present;
  // otherwise fall back to the built-in defaults. Optional chaining here
  // isn't just defensive — the backend may not have deployed the
  // tenets_intro/tenets/tenets_outro fields yet, in which case they're
  // simply absent from the API response rather than null.
  const tenetsIntro = church.tenets_intro || TENETS_INTRO;
  const tenets = church.tenets?.length ? church.tenets : TENETS;
  const tenetsOutro = church.tenets_outro || TENETS_OUTRO;
  const [introLead, ...introRest] = tenetsIntro.split(/\n{2,}/).filter(Boolean);

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

      {/* What We Believe — an editorial "doctrinal statement" treatment
          (ghost numerals, two-column reading grid, no cards/accordion)
          deliberately unlike the rest of the site's card-based sections. */}
      <section className={`py-24 border-t border-warm-deep ${hasCarousel ? "" : "bg-warm"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
              Our Tenets
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-ink mb-8">
              What We Believe
            </h2>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p className="first-letter:font-display first-letter:text-6xl first-letter:font-medium first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-[0.85]">
                {introLead}
              </p>
              {introRest.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <TenetsList tenets={tenets} />

          <p className="mt-16 pt-8 border-t border-warm-deep text-sm text-ink-soft italic max-w-2xl">
            {tenetsOutro}
          </p>
        </div>
      </section>

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
