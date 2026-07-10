"use client";

import { useState } from "react";

const TABS = ["Sermons", "Bulletins"] as const;

/**
 * The Resources page's tab switcher. The two panels arrive pre-rendered
 * from the server component (sermon/bulletin grids); this just toggles
 * which one is shown, same pattern as ContactTabs.
 */
export default function ResourceTabs({
  sermonsPanel,
  bulletinsPanel,
}: {
  sermonsPanel: React.ReactNode;
  bulletinsPanel: React.ReactNode;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Sermons");

  return (
    <div>
      <div className="flex justify-center gap-1 mb-12" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t ? "true" : "false"}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "px-5 py-2 text-sm font-medium rounded-sm bg-primary text-white"
                : "px-5 py-2 text-sm font-medium rounded-sm text-ink-soft hover:bg-warm hover:text-primary transition-colors"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className={tab === "Sermons" ? "" : "hidden"}>{sermonsPanel}</div>
      <div className={tab === "Bulletins" ? "" : "hidden"}>{bulletinsPanel}</div>
    </div>
  );
}
