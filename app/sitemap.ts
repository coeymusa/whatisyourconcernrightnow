import type { MetadataRoute } from "next";
import { COUNTRIES } from "./lib/countries";
import { fetchRecent, hasSupabase } from "./lib/supabase";
import { CATEGORY_ORDER } from "./lib/types";

const SITE_URL = "https://whatisyourconcern.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/world`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE_URL}/topics`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE_URL}/featured`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/world/${c.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const topicPages: MetadataRoute.Sitemap = CATEGORY_ORDER.map((slug) => ({
    url: `${SITE_URL}/topics/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  // Per-dispatch permalinks. Cap at 1000 — newer concerns first.
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
