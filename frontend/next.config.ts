import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
    // Laravel media lives under /storage (medialibrary) and /uploads (legacy)
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
    // Local dev only: the Laravel API serves media from 127.0.0.1:8000.
    // Remove when the API is on a public hostname in production.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
