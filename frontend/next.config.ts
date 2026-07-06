import type { NextConfig } from "next";

function remoteImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
  ];

  if (process.env.API_URL) {
    try {
      const apiUrl = new URL(process.env.API_URL);

      if (apiUrl.protocol === "http:" || apiUrl.protocol === "https:") {
        patterns.push({
          protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
          hostname: apiUrl.hostname,
          port: apiUrl.port || undefined,
        });
      }
    } catch {
      // Invalid API_URL should fail at runtime fetches, not while loading config.
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
      { source: "/posts", destination: "/blog", permanent: true },
      { source: "/post/:id", destination: "/blog/:id", permanent: true },
      { source: "/event/:id", destination: "/events/:id", permanent: true },
      { source: "/sermon/:id", destination: "/sermons/:id", permanent: true },
      // No per-item bulletin page exists in the new site; fall back to the list.
      { source: "/bulletin/:id", destination: "/bulletins", permanent: true },
      { source: "/prayer-requests", destination: "/prayer-board", permanent: true },
    ];
  },
  images: {
    // Laravel media lives under /storage (medialibrary) and /uploads (legacy).
    remotePatterns: remoteImagePatterns(),
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
