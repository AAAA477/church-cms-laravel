import type { Tenet } from "@/lib/tenets";

// Scripture citations are the "(Book chapter:verse; …)" groups — tint them
// so the doctrine statement reads as the primary line and the references
// read as supporting detail.
function withScriptureRefs(text: string) {
  return text.split(/(\([^)]*\))/g).map((part, i) =>
    part.startsWith("(") && part.endsWith(")") ? (
      <span key={i} className="text-primary/70 font-medium">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * The 11 tenets as a single readable column of cards. One per row (not a
 * two-column grid) so the body text keeps a comfortable measure and size;
 * a large display numeral and an alternating accent rule give each card
 * visual identity without shrinking the type.
 */
export default function TenetsList({ tenets }: { tenets: Tenet[] }) {
  return (
    <ol className="space-y-5">
      {tenets.map((tenet, i) => {
        const alt = i % 2 === 1;
        return (
          <li
            key={tenet.title}
            className="group relative overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-warm-deep transition-shadow hover:shadow-md"
          >
            {/* Alternating accent rail down the left edge */}
            <span
              aria-hidden
              className={
                "absolute inset-y-0 left-0 w-1 " + (alt ? "bg-accent" : "bg-primary")
              }
            />
            {/* Oversized watermark numeral */}
            <span
              aria-hidden
              className={
                "pointer-events-none absolute -top-6 right-2 select-none font-display text-9xl leading-none " +
                (alt ? "text-accent/10" : "text-primary/[0.07]")
              }
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="relative grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 p-6 sm:p-8 sm:pl-9">
              <span
                className={
                  "font-display text-3xl sm:text-4xl leading-none " +
                  (alt ? "text-accent" : "text-primary")
                }
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl sm:text-[1.7rem] text-ink">
                {tenet.title}
              </h3>
              <p className="col-start-2 text-base sm:text-lg text-ink-soft leading-relaxed">
                {withScriptureRefs(tenet.body)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
