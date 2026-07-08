"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

// Same link set (and order) as the legacy theme's _nav_bar; Donation is
// covered by the standalone Give button.
const links = [
  { href: "/", label: "Home" },
  { href: "/pages", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sermons", label: "Sermons" },
  { href: "/bulletins", label: "Bulletins" },
  { href: "/faq", label: "FAQ" },
  { href: "/prayer-board", label: "Prayer" },
  { href: "/help-requests", label: "Help" },
  { href: "/contact", label: "Contact" },
];

const memberLinks = [
  { href: "/member", label: "Dashboard" },
  { href: "/member/profile", label: "My Profile" },
  { href: "/member/groups", label: "My Groups" },
  { href: "/member/give", label: "Donate" },
  { href: "/member/change-password", label: "Change Password" },
];

export type NavMember = {
  name: string;
  email: string | null;
  avatar: string | null;
  isGuest: boolean;
};

type NavBarProps = {
  churchName: string;
  churchLogo?: string | null;
  tagline?: string;
  member?: NavMember | null;
};

export default function NavBar({ churchName, churchLogo, tagline, member }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/bff/auth/logout", { method: "POST" });
    setOpen(false);
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  }

  const initial = (member?.name ?? churchName).charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            {churchLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={churchLogo}
                alt={`${churchName} logo`}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-xl">
                {churchName.charAt(0)}
              </span>
            )}
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
          <div className="hidden xl:flex items-center gap-5">
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
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {member ? (
              /* Avatar + dropdown (desktop) — mirrors legacy signed-in nav */
              <div className="relative hidden xl:block" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 focus:outline-none group"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  {member.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-accent group-hover:ring-primary transition"
                    />
                  ) : (
                    <span className="flex w-10 h-10 items-center justify-center rounded-full bg-warm ring-2 ring-accent group-hover:ring-primary transition text-primary font-semibold text-sm">
                      {initial}
                    </span>
                  )}
                  <svg
                    className={clsx(
                      "w-4 h-4 text-ink-soft transition-transform",
                      profileOpen && "rotate-180",
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 bg-white rounded-sm shadow-lg border border-warm-deep py-1 z-50"
                  >
                    <div className="px-4 py-3 border-b border-warm-deep">
                      <p className="text-sm font-semibold text-ink truncate">
                        {member.name}
                      </p>
                      {member.email && (
                        <p className="text-xs text-ink-soft truncate">{member.email}</p>
                      )}
                      {member.isGuest && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-warm text-primary font-medium">
                          Guest
                        </span>
                      )}
                    </div>
                    {!member.isGuest &&
                      memberLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-ink hover:bg-warm hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Register + Sign In (desktop) — mirrors legacy signed-out nav */
              <div className="hidden xl:flex items-center gap-2">
                <Link
                  href="/member/register"
                  className="px-4 py-2 border border-primary text-primary text-sm font-medium rounded-sm transition-colors hover:bg-warm"
                >
                  Register
                </Link>
                <Link
                  href="/member/login"
                  className="px-4 py-2 bg-primary border border-primary text-white text-sm font-medium rounded-sm transition-colors hover:bg-primary-dark"
                >
                  Sign In
                </Link>
              </div>
            )}

            <Link
              href="/member/give"
              className="hidden xl:inline-block bg-primary border-2 border-primary text-white text-sm font-medium uppercase tracking-wider px-5 py-2 rounded-sm transition-all hover:bg-primary-dark hover:border-primary-dark"
            >
              Give
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="xl:hidden p-2 text-primary"
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
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="xl:hidden pb-4 flex flex-col space-y-1">
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
              href="/member/give"
              onClick={() => setOpen(false)}
              className="mx-4 mt-2 bg-primary text-white text-center text-sm font-medium uppercase tracking-wider px-6 py-2.5 rounded-sm"
            >
              Give
            </Link>

            <div className="border-t border-warm-deep pt-2 mt-2 space-y-1">
              {member ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-ink">{member.name}</p>
                    {member.email && (
                      <p className="text-xs text-ink-soft">{member.email}</p>
                    )}
                    {member.isGuest && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-warm text-primary font-medium">
                        Guest
                      </span>
                    )}
                  </div>
                  {!member.isGuest &&
                    memberLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm font-medium rounded transition-colors text-ink hover:bg-warm hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-medium rounded text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-4 space-y-2 pt-1">
                  <Link
                    href="/member/register"
                    onClick={() => setOpen(false)}
                    className="block border border-primary text-primary text-center text-sm font-medium rounded-sm px-4 py-2 transition-colors hover:bg-warm"
                  >
                    Register
                  </Link>
                  <Link
                    href="/member/login"
                    onClick={() => setOpen(false)}
                    className="block bg-primary text-white text-center text-sm font-medium rounded-sm px-4 py-2 transition-colors hover:bg-primary-dark"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
