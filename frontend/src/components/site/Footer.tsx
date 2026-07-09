import Link from "next/link";
import BackToTop from "@/components/site/BackToTop";
import type { ChurchDetails } from "@/lib/api-types";

// Column structure mirrors the legacy theme's _footer: Explore, Ministries,
// Get in Touch — new palette kept.
const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/pages", label: "About Us" },
  { href: "/blog", label: "Blog & News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/bulletins", label: "Bulletins" },
  { href: "/faq", label: "FAQ" },
];

const ministryLinks = [
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/prayer-board", label: "Prayer Requests" },
  { href: "/help-requests", label: "Help Requests" },
  { href: "/contact", label: "Contact Us" },
];

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  );
}

export default function Footer({
  church,
  isSignedIn = false,
}: {
  church: ChurchDetails;
  isSignedIn?: boolean;
}) {
  const socials = [
    { href: church.facebook, label: "Facebook", icon: <FacebookIcon /> },
    { href: church.twitter, label: "Twitter / X", icon: <TwitterIcon /> },
    { href: church.instagram, label: "Instagram", icon: <InstagramIcon /> },
    // Admin-defined links beyond the fixed platforms (Settings → Social Media)
    ...(church.extra_links ?? []).map((l) => ({
      href: l.url,
      label: l.label,
      icon: <LinkIcon />,
    })),
  ].filter((s) => s.href);

  return (
    <footer className="bg-ink text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl text-accent mb-4">
            {church.church_name}
          </h3>
          <p className="text-sm leading-relaxed text-cream/70 max-w-xs">
            {church.short_summary ??
              "A loving community of faith, rooted in the gospel of Jesus Christ."}
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-cream/50 transition-colors hover:text-accent"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent mb-4">
            Explore
          </h4>
          <ul className="space-y-2">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream/70 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ministries */}
        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent mb-4">
            Ministries
          </h4>
          <ul className="space-y-2">
            {ministryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream/70 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in Touch */}
        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent mb-4">
            Get in Touch
          </h4>
          <ul className="space-y-3 text-sm text-cream/70">
            {church.address && <li>{church.address}</li>}
            {church.phone && (
              <li>
                <a href={`tel:${church.phone}`} className="hover:text-accent">
                  {church.phone}
                </a>
              </li>
            )}
            {church.email && (
              <li>
                <a href={`mailto:${church.email}`} className="hover:text-accent">
                  {church.email}
                </a>
              </li>
            )}
            <li className="pt-2">
              <Link
                href="/contact"
                className="inline-block bg-primary text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors hover:bg-primary-dark"
              >
                Send a Message
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} {church.church_name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {isSignedIn ? (
              <Link href="/member" className="hover:text-accent">
                Member Portal
              </Link>
            ) : (
              <Link href="/console/login" className="hover:text-accent">
                Staff Login
              </Link>
            )}
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
