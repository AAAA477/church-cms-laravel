"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

type NavLink = { href: string; label: string; icon: string };
type NavItem =
  | { type: "link"; link: NavLink }
  | { type: "group"; label: string; icon: string; links: NavLink[] };

// Same structure and order as the legacy admin sidebar
// (resources/views/layouts/admin/menu.blade.php).
const items: NavItem[] = [
  { type: "link", link: { href: "/console", label: "Dashboard", icon: "📊" } },
  {
    type: "group",
    label: "Users",
    icon: "👥",
    links: [
      { href: "/console/members", label: "Members", icon: "👥" },
      { href: "/console/guests", label: "Guests", icon: "🙋" },
      { href: "/console/subadmins", label: "Sub Admins", icon: "🛡️" },
    ],
  },
  { type: "link", link: { href: "/console/groups", label: "Groups", icon: "🧩" } },
  { type: "link", link: { href: "/console/events", label: "Events / Calendar", icon: "📅" } },
  { type: "link", link: { href: "/console/sermons", label: "Sermons", icon: "🎙️" } },
  { type: "link", link: { href: "/console/bulletins", label: "Bulletin", icon: "📰" } },
  { type: "link", link: { href: "/console/gallery", label: "Gallery", icon: "🖼️" } },
  { type: "link", link: { href: "/console/mediafiles", label: "Media Files", icon: "🎞️" } },
  { type: "link", link: { href: "/console/quotes", label: "Quotes / Bible Verse", icon: "💬" } },
  { type: "link", link: { href: "/console/prayer-board", label: "Prayer Board", icon: "🙏" } },
  { type: "link", link: { href: "/console/helps", label: "Help Requests", icon: "🆘" } },
  { type: "link", link: { href: "/console/messages", label: "Messages", icon: "✉️" } },
  {
    type: "group",
    label: "Offerings",
    icon: "💰",
    links: [
      { href: "/console/donations", label: "Donations", icon: "💳" },
      { href: "/console/payaccounts", label: "Payaccounts", icon: "🏦" },
      { href: "/console/paymentgateways", label: "Payment Gateways", icon: "🔁" },
      { href: "/console/funds", label: "Funds", icon: "💵" },
    ],
  },
  {
    type: "group",
    label: "Email Blaster",
    icon: "📨",
    links: [
      { href: "/console/campaigns", label: "Campaigns", icon: "📢" },
      { href: "/console/emails", label: "Emails", icon: "📧" },
      { href: "/console/subscribers", label: "Subscribers", icon: "👤" },
      { href: "/console/mailing-lists", label: "Mailing List", icon: "📋" },
      { href: "/console/newsletter", label: "Send Newsletter", icon: "🗞️" },
      { href: "/console/rules", label: "Rules", icon: "⚖️" },
      { href: "/console/mails-delivered", label: "Mails Delivered", icon: "✅" },
      { href: "/console/mailqueues", label: "Mail Queues", icon: "⏳" },
      { href: "/console/smtps", label: "SMTPs", icon: "🖥️" },
      { href: "/console/webhooks", label: "Webhooks", icon: "🔌" },
    ],
  },
  { type: "link", link: { href: "/console/contacts", label: "Contact Requests", icon: "📞" } },
  { type: "link", link: { href: "/console/feedbacks", label: "Feedbacks", icon: "📝" } },
  { type: "link", link: { href: "/console/reports", label: "Reports", icon: "📈" } },
  { type: "link", link: { href: "/console/activity-log", label: "Activity Logs", icon: "🕓" } },
  {
    type: "group",
    label: "WebCMS",
    icon: "🌐",
    links: [
      { href: "/console/pages", label: "Pages", icon: "📄" },
      { href: "/console/posts", label: "Posts", icon: "✏️" },
      { href: "/console/faq", label: "FAQ", icon: "❓" },
      { href: "/console/widgets", label: "Code Snippets", icon: "🧱" },
      { href: "/console/pages/categories", label: "Page Categories", icon: "📁" },
      { href: "/console/posts/categories", label: "Post Categories", icon: "🗂️" },
      { href: "/console/google-analytics", label: "Google Analytics", icon: "📉" },
    ],
  },
  { type: "link", link: { href: "/console/settings", label: "Settings", icon: "⚙️" } },
  {
    type: "group",
    label: "Master Data",
    icon: "🗄️",
    links: [
      { href: "/console/countries", label: "Countries", icon: "🌍" },
      { href: "/console/states", label: "States", icon: "🗺️" },
      { href: "/console/cities", label: "Cities", icon: "🏙️" },
    ],
  },
  { type: "link", link: { href: "/console/profile", label: "My Profile", icon: "👤" } },
];

export default function AdminNav({
  name,
  churchName = "Church",
  churchLogo,
}: {
  name: string;
  churchName?: string;
  churchLogo?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isActive = (href: string) =>
    href === "/console" ? pathname === "/console" : pathname.startsWith(href);

  const groupHasActive = (links: NavLink[]) => links.some((l) => isActive(l.href));

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !isGroupOpen(label) }));
  }

  function isGroupOpen(label: string) {
    if (label in openGroups) return openGroups[label];
    const item = items.find((i) => i.type === "group" && i.label === label);
    return item?.type === "group" ? groupHasActive(item.links) : false;
  }

  async function handleLogout() {
    setSigningOut(true);
    await fetch("/bff/admin/auth/logout", { method: "POST" });
    router.push("/console/login");
    router.refresh();
  }

  const linkClasses = (active: boolean, indent = false) =>
    clsx(
      "flex items-center gap-3 py-2.5 rounded-sm text-sm font-medium transition-colors",
      indent ? "px-3 ml-4" : "px-3",
      active
        ? "bg-primary/20 text-accent border-l-2 border-accent"
        : "text-cream/80 hover:bg-white/5 hover:text-cream",
    );

  return (
    <aside className="w-64 shrink-0 bg-ink text-cream min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-cream/10">
        <Link href="/console" className="flex items-center gap-3">
          {churchLogo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={churchLogo}
              alt={`${churchName} logo`}
              className="h-10 w-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-lg shrink-0">
              {churchName.charAt(0)}
            </span>
          )}
          <div>
            <p className="font-display text-xl text-accent leading-tight">{churchName}</p>
            <p className="text-xs text-cream/60">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {items.map((item) =>
          item.type === "link" ? (
            <Link
              key={item.link.href}
              href={item.link.href}
              className={linkClasses(isActive(item.link.href))}
            >
              <span aria-hidden>{item.link.icon}</span>
              {item.link.label}
            </Link>
          ) : (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors",
                  groupHasActive(item.links)
                    ? "text-accent"
                    : "text-cream/80 hover:bg-white/5 hover:text-cream",
                )}
                aria-expanded={isGroupOpen(item.label)}
              >
                <span aria-hidden>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                <span
                  aria-hidden
                  className={clsx(
                    "text-xs transition-transform",
                    isGroupOpen(item.label) && "rotate-90",
                  )}
                >
                  ›
                </span>
              </button>
              {isGroupOpen(item.label) && (
                <div className="space-y-1 mt-1">
                  {item.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={linkClasses(isActive(link.href), true)}
                    >
                      <span aria-hidden>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
      </nav>

      <div className="px-6 py-4 border-t border-cream/10">
        <p className="text-sm text-cream/70 truncate">Signed in as</p>
        <p className="text-sm font-medium text-cream truncate mb-3">{name}</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="text-xs font-medium uppercase tracking-wider text-accent hover:text-cream disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
