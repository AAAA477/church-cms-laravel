import type { Tenet } from "@/lib/tenets";

// Scripture citations are the "(Book chapter:verse; …)" groups — tint them
// so the doctrine statement reads as the primary line and the references
// read as supporting detail, without needing to hide anything behind a click.
function withScriptureRefs(text: string) {
  return text.split(/(\([^)]*\))/g).map((part, i) =>
    part.startsWith("(") && part.endsWith(")") ? (
      <span key={i} className="text-primary/80">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Editorial list treatment for the 11 tenets — large ghost numerals and a
 * two-column reading grid, deliberately unlike the site's card/accordion
 * components (homepage events & sermons, FAQ) so this reads as a doctrinal
 * document rather than another marketing section.
 */
export default function TenetsList({ tenets }: { tenets: Tenet[] }) {
  return (
    <div className="grid gap-x-14 gap-y-12 lg:grid-cols-2">
      {tenets.map((tenet, i) => {
        const alt = i % 2 === 1;
        return (
          <article key={tenet.title} className="relative pl-16 sm:pl-20">
            <span
              className={
                "absolute left-0 -top-2 font-display text-6xl sm:text-7xl leading-none select-none " +
                (alt ? "text-accent/25" : "text-primary/15")
              }
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl text-ink">{tenet.title}</h3>
            <div className={"h-px w-10 my-3 " + (alt ? "bg-accent" : "bg-primary")} aria-hidden />
            <p className="text-ink-soft leading-relaxed">{withScriptureRefs(tenet.body)}</p>
          </article>
        );
      })}
    </div>
  );
}
