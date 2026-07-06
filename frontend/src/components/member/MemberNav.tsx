"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/member", label: "Dashboard" },
  { href: "/member/groups", label: "My Groups" },
  { href: "/member/give", label: "Give" },
  { href: "/member/notifications", label: "Notifications" },
  { href: "/member/profile", label: "Profile" },
  { href: "/member/change-password", label: "Password" },
];

export default function MemberNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/bff/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-xl">
              C
            </span>
            <span className="block font-display text-2xl font-semibold text-primary">
              Church
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => {
              const active =
                link.href === "/member"
                  ? pathname === "/member"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "text-sm font-medium tracking-wide transition-colors hover:text-primary",
                    active ? "text-primary" : "text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-ink-soft">
              Hi, {name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium uppercase tracking-wider text-primary hover:text-primary-dark"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="md:hidden flex gap-4 pb-4 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-sm font-medium text-ink-soft hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
