import type { MetadataRoute } from "next";
import { COUNTRIES } from "./lib/countries";
import { CATEGORY_ORDER } from "./lib/types";
import { fetchRecent, hasSupabase } from "./lib/supabase";

const SITE_URL = "https://whatisyourconcern.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/manifesto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pulse`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/world`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/topics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/world/${c.code}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const topicPages: MetadataRoute.Sitemap = CATEGORY_ORDER.filter(
    (c) => c !== "other",
  ).map((c) => ({
    url: `${SITE_URL}/topics/${c}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // Per-dispatch permalinks. Cap at 500 so the sitemap doesn't bloat past the
  // Google sitemap soft limit. Newer concerns are listed first.
  let dispatchPages: MetadataRoute.Sitemap = [];
  if (hasSupabase()) {
    try {
      const rows = await fetchRecent(500, 0, 0);
      dispatchPages = rows.map((r) => ({
        url: `${SITE_URL}/dispatch/${r.id}`,
        lastModified: new Date(r.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
    } catch {
      dispatchPages = [];
    }
  }

  return [
    ...staticPages,
    ...countryPages,
    ...topicPages,
    ...dispatchPages,
  ];
}
