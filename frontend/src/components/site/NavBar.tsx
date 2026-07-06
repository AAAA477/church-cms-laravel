"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/prayer-board", label: "Prayer" },
  { href: "/contact", label: "Contact" },
];

type NavBarProps = {
  churchName: string;
  tagline?: string;
};

export default function NavBar({ churchName, tagline }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-xl">
              {churchName.charAt(0)}
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold text-primary">
                {churchName}
              </span>
              {tagline && (
                <span className="block text-xs text-ink-soft">{tagline}</span>
              )}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium tracking-wide transition-colors hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium tracking-wide text-ink transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/member/give"
              className="bg-primary border-2 border-primary text-white text-sm font-medium uppercase tracking-wider px-6 py-2.5 rounded-sm transition-all hover:bg-primary-dark hover:border-primary-dark"
            >
              Give
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-primary"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-4 flex flex-col space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded transition-colors hover:bg-warm hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded transition-colors text-ink hover:bg-warm hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/member/give"
              onClick={() => setOpen(false)}
              className="mx-4 mt-2 bg-primary text-white text-center text-sm font-medium uppercase tracking-wider px-6 py-2.5 rounded-sm"
            >
              Give
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
