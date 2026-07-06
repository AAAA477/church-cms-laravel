import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
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
