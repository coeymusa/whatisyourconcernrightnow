import type { MetadataRoute } from "next";

// Generates /sitemap.xml. Single-page site for now, but the lastModified
// is set at build time so each redeploy refreshes Google's signal.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://whatisyourconcern.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
