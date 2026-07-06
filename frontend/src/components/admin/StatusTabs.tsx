import Link from "next/link";
import clsx from "clsx";

export default function StatusTabs({
  basePath,
  current,
  tabs,
}: {
  basePath: string;
  current: string;
  tabs: { value: string; label: string; count?: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-warm-deep mb-6">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`${basePath}?status=${tab.value}`}
          className={clsx(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            current === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-ink-soft hover:text-ink",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" && <span className="ml-1.5 text-xs text-ink-soft">({tab.count})</span>}
        </Link>
      ))}
    </div>
  );
}
