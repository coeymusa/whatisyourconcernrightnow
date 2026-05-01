import type { MetadataRoute } from "next";

// Generates /robots.txt at build time. Tells crawlers everything is
// indexable EXCEPT the API routes — there's no SEO value in indexing
// JSON endpoints, and it discourages bots from polling the read APIs.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/api/admin/"],
      },
    ],
    sitemap: "https://whatisyourconcern.com/sitemap.xml",
    host: "https://whatisyourconcern.com",
  };
}
