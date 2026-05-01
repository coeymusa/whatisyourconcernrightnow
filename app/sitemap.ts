import type { MetadataRoute } from "next";
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
  ];

  // Per-dispatch permalinks. Cap at 500 so the sitemap stays under Google's
  // soft limit; newer concerns first.
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

  return [...staticPages, ...dispatchPages];
}
