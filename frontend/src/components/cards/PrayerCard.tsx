"use client";

import { useState } from "react";
import LiftPrayerButton from "@/components/prayer/LiftPrayerButton";
import { categoryGradient, gradientStyle } from "@/components/prayer/gradients";
import type { PrayerRequest } from "@/lib/api-types";

export default function PrayerCard({ prayer }: { prayer: PrayerRequest }) {
  const [count, setCount] = useState(prayer.total_prayers);

  return (
    <article className="bg-white rounded-sm shadow-sm overflow-hidden card-hover flex flex-col">
      <div
        className="px-6 py-3 flex items-center justify-between text-white"
        style={gradientStyle(categoryGradient(prayer.category))}
      >
        <span className="text-sm font-semibold">
          {prayer.category ?? "✨ Other"}
        </span>
        <span className="text-xs opacity-90">{prayer.date}</span>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-ink leading-relaxed flex-1">{prayer.text}</p>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-ink-soft">
            <span className="font-display text-2xl text-primary mr-1">
              {count}
            </span>
            {count === 1 ? "person has" : "people have"} prayed
            <p className="text-xs mt-0.5">
              requested by {prayer.requested_person}
            </p>
          </div>

          <LiftPrayerButton
            prayerId={prayer.id}
            category={prayer.category}
            onLifted={(breakdown) => setCount(breakdown.total)}
          />
        </div>
      </div>
    </article>
  );
}
