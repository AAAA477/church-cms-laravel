import type { NextConfig } from "next";

function remoteImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
  ];

  // API_URL: where the Next server fetches data from (may be an internal
  // Docker hostname). SITE_URL: the public origin — in the reverse-proxy
  // topology Laravel's APP_URL is the same public domain, so media URLs in
  // API responses carry this hostname and next/image must allow it.
  for (const raw of [process.env.API_URL, process.env.SITE_URL]) {
    if (!raw) continue;
    try {
      const url = new URL(raw);

      if (url.protocol === "http:" || url.protocol === "https:") {
        patterns.push({
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port || undefined,
        });
      }
    } catch {
      // Invalid URL should fail at runtime fetches, not while loading config.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  ...(process.env.NETLIFY ? {} : { output: "standalone" }),
  turbopack: {
    root: process.cwd(),
  },
  // Legacy Blade WebBuilder URLs → their Next.js equivalents, for paths
  // whose structure actually changed during the rebuild. Paths that kept
  // the same shape (/faq, /gallery, /events, /sermons, /bulletins,
  // /help-requests, /contact) need no redirect.
  async redirects() {
    return [
      { source: "/page/:category/:slug", destination: "/pages/:category/:slug", permanent: true },
      { source: "/posts", destination: "/devotions", permanent: true },
      { source: "/post/:id", destination: "/devotions/:id", permanent: true },
      // Blog renamed to Devotions (2026-07-10).
      { source: "/blog", destination: "/devotions", permanent: true },
      { source: "/blog/:id", destination: "/devotions/:id", permanent: true },
      { source: "/event/:id", destination: "/events/:id", permanent: true },
      { source: "/sermon/:id", destination: "/sermons/:id", permanent: true },
      // No per-item bulletin page exists in the new site; fall back to Resources.
      { source: "/bulletin/:id", destination: "/resources", permanent: true },
      // Sermons + bulletins list pages merged into /resources (2026-07-09);
      // sermon detail pages keep /sermons/:id.
      { source: "/sermons", destination: "/resources", permanent: true },
      { source: "/bulletins", destination: "/resources", permanent: true },
      { source: "/prayer-requests", destination: "/prayer-board", permanent: true },
    ];
  },
  images: {
    // Laravel media lives under /storage (medialibrary) and /uploads (legacy).
    remotePatterns: remoteImagePatterns(),
    // LOCAL_TOPOLOGY_TEST=1: running the production Docker stack on
    // localhost. The image optimizer can't fetch media there (the public
    // origin isn't resolvable from inside the frontend container), so serve
    // images unoptimized — the browser loads them straight from the origin.
    unoptimized: process.env.LOCAL_TOPOLOGY_TEST === "1",
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV !== "production" ||
      process.env.LOCAL_TOPOLOGY_TEST === "1",
  },
};

export default nextConfig;
