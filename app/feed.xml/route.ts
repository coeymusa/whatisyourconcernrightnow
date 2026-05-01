import { fetchRecent, hasSupabase } from "../lib/supabase";
import { findCountry } from "../lib/countries";
import { CATEGORY_LABELS, type ConcernCategory } from "../lib/types";

const SITE_URL = "https://whatisyourconcern.com";
const FEED_URL = `${SITE_URL}/feed.xml`;

export const revalidate = 600; // refresh every 10 min

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(d: Date): string {
  return d.toUTCString();
}

export async function GET() {
  const rows = hasSupabase() ? await fetchRecent(100, 0, 0) : [];

  const items = rows
    .map((r) => {
      const country = findCountry(r.country_code);
      const category = r.category as ConcernCategory;
      const url = `${SITE_URL}/dispatch/${r.id}`;
      const titlePreview =
        r.text.length > 70 ? `${r.text.slice(0, 68)}…` : r.text;
      const title = `"${titlePreview}" — anon dispatch from ${
        country?.name ?? r.country_code
      }`;
      const description = [
        `Country: ${country?.name ?? r.country_code}`,
        `Ages: ${r.bracket}`,
        `Topic: ${CATEGORY_LABELS[category] ?? category}`,
        ``,
        r.text,
      ].join("\n");

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(new Date(r.created_at))}</pubDate>
      <category>${escapeXml(CATEGORY_LABELS[category] ?? "concern")}</category>
      <category>${escapeXml(country?.name ?? r.country_code)}</category>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>what is your concern?</title>
    <link>${SITE_URL}</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>An anonymous global record of what humanity is afraid of, right now. Every entry is a single sentence written by one person, never edited and never removed.</description>
    <language>en-us</language>
    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>
    <ttl>10</ttl>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
