import Link from "next/link";
import type { ChurchDetails } from "@/lib/api-types";

const quickLinks = [
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/prayer-board", label: "Prayer Board" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ church }: { church: ChurchDetails }) {
  const socials = [
    { href: church.facebook, label: "Facebook" },
    { href: church.twitter, label: "Twitter" },
    { href: church.instagram, label: "Instagram" },
    { href: church.website, label: "Website" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-ink text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl text-accent mb-4">
            {church.church_name}
          </h3>
          {church.short_summary && (
            <p className="text-sm leading-relaxed text-cream/70 max-w-xs">
              {church.short_summary}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
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

        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent mb-4">
            Connect
          </h4>
          <ul className="space-y-2 text-sm text-cream/70">
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
          </ul>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream/70 transition-colors hover:text-accent"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} {church.church_name}. All rights reserved.
          </p>
          <Link href="/member" className="hover:text-accent">
            Member Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
