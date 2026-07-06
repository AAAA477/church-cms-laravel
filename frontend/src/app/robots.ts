import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL ?? process.env.DEPLOY_PRIME_URL ?? process.env.URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/member", "/bff"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
