"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AboutSlide } from "@/lib/api-types";

/**
 * Homepage About Us carousel. Slides are managed in the admin console
 * (Settings > About > Homepage Carousel Slides). Crossfades every 7s,
 * pauses while hovered; slides are grid-stacked so the section takes the
 * height of the tallest slide (no layout shift between slides).
 */
export default function AboutCarousel({ slides }: { slides: AboutSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(
    () => setActive((a) => (a + 1) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    timer.current = setInterval(next, 7000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length, paused, next]);

  if (slides.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="grid">
        {slides.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            className={
              "col-start-1 row-start-1 transition-opacity duration-700 " +
              (i === active ? "opacity-100" : "opacity-0 pointer-events-none")
            }
          >
            <div className="grid gap-10 md:grid-cols-2 items-center">
              {slide.image ? (
                <div className="relative h-72 sm:h-96 rounded-sm overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.title || "About us"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="hidden md:block" />
              )}
              <div>
                {slide.title && (
                  <h3 className="font-display text-3xl sm:text-4xl text-ink mb-4">
                    {slide.title}
                  </h3>
                )}
                {slide.text && (
                  <p className="text-ink-soft leading-relaxed whitespace-pre-line">
                    {slide.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setActive((a) => (a - 1 + slides.length) % slides.length)}
            className="w-10 h-10 rounded-full border border-warm-deep text-ink-soft hover:border-primary hover:text-primary transition-colors"
          >
            ←
          </button>
          <div className="flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={
                  "w-2.5 h-2.5 rounded-full transition-colors " +
                  (i === active ? "bg-primary" : "bg-warm-deep hover:bg-accent")
                }
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="w-10 h-10 rounded-full border border-warm-deep text-ink-soft hover:border-primary hover:text-primary transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
