"use client";

import { useState } from "react";
import clsx from "clsx";

type Item = { id: number; question: string; answer: string };

export default function Accordion({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="bg-white rounded-sm shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-warm/50"
            >
              <span className="font-display text-xl text-ink">
                {item.question}
              </span>
              <svg
                className={clsx(
                  "h-5 w-5 shrink-0 text-primary transition-transform duration-300",
                  open && "rotate-180",
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={clsx(
                "grid transition-[grid-template-rows] duration-300",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-ink-soft leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
