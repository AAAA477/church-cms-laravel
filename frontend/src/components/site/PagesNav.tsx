"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { PageNavGroup } from "@/lib/api-types";

export default function PagesNav({ groups }: { groups: PageNavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Pages" className="space-y-8">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">
            {group.category}
          </h3>
          <ul className="space-y-1">
            {group.pages.map((page) => {
              const href = `/pages/${group.category_slug}/${page.slug}`;
              const active = pathname === href;
              return (
                <li key={page.id}>
                  <Link
                    href={href}
                    className={clsx(
                      "block px-3 py-2 rounded-sm text-sm transition-colors",
                      active
                        ? "bg-warm text-primary font-medium"
                        : "text-ink-soft hover:bg-warm/60 hover:text-primary",
                    )}
                  >
                    {page.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
