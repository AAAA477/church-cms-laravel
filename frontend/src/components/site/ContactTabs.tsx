"use client";

import { useState } from "react";
import Link from "next/link";
import ContactForm from "@/components/site/ContactForm";
import PrayerRequestForm from "@/components/site/PrayerRequestForm";
import HelpRequestForm from "@/components/site/HelpRequestForm";

type Category = { id: number; name: string };

const TABS = ["Send a Message", "Prayer Request", "Help Request"] as const;

/**
 * The Contact page's unified form area: contacting the church, submitting a
 * prayer request, and asking for help all live here (the old standalone
 * Prayer/Help nav destinations were folded into Contact).
 */
export default function ContactTabs({ prayerCategories }: { prayerCategories: Category[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Send a Message");

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-8 border-b border-warm-deep pb-3" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t ? "true" : "false"}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "px-4 py-2 text-sm font-medium rounded-sm bg-primary text-white"
                : "px-4 py-2 text-sm font-medium rounded-sm text-ink-soft hover:bg-warm hover:text-primary transition-colors"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className={tab === "Send a Message" ? "" : "hidden"}>
        <ContactForm />
      </div>
      <div className={tab === "Prayer Request" ? "" : "hidden"}>
        <PrayerRequestForm categories={prayerCategories} />
        <p className="mt-6 text-sm text-ink-soft">
          Want to pray for others?{" "}
          <Link href="/prayer-board" className="text-primary hover:underline">
            Visit the Prayer Board →
          </Link>
        </p>
      </div>
      <div className={tab === "Help Request" ? "" : "hidden"}>
        <HelpRequestForm />
      </div>
    </div>
  );
}
