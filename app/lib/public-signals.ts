// Mappings + composers that turn raw source fetchers into per-country and
// per-topic public-discourse feeds.

import {
  dedupe,
  fetchGdelt,
  fetchGoogleNews,
  fetchHN,
  fetchRedditHot,
  interleave,
  type PublicSignal,
} from "./sources";
import { findCountry } from "./countries";
import type { ConcernCategory } from "./types";

// Reddit country subreddit map, restricted to subs that are reliably
// English-speaking. Native-language subs (r/brasil, r/sweden, r/france,
// r/de) get filtered to almost-zero by the English-only filter, so we don't
// even try them — those countries fall back to GDELT-only news.
const COUNTRY_SUBREDDIT: Record<string, string> = {
  US: "news",
  GB: "unitedkingdom",
  CA: "canada",
  AU: "australia",
  NZ: "newzealand",
  IE: "ireland",
  IN: "india",
  PK: "pakistan",
  BD: "bangladesh",
  SG: "singapore",
  PH: "Philippines",
  MY: "malaysia",
  HK: "HongKong",
  ZA: "southafrica",
  NG: "Nigeria",
  KE: "Kenya",
  EG: "Egypt",
  IL: "Israel",
  AE: "dubai",
  TR: "Turkey",
};

// Topic → one or more subreddits (interleaved) and an HN query.
const TOPIC_SUBS: Record<ConcernCategory, string[]> = {
  economy: ["Economics", "economy"],
  climate: ["climatechange", "climate"],
  war: ["worldnews", "geopolitics"],
  democracy: ["PoliticalDiscussion", "democracy"],
  health: ["Health", "publichealth"],
  ai: ["artificial", "OpenAI"],
  loneliness: ["lonely", "MensLib"],
  housing: ["REBubble", "Renters"],
  inequality: ["Economics", "LateStageCapitalism"],
  education: ["Teachers", "education"],
  future: ["Futurology", "collapse"],
  other: [],
};

const TOPIC_HN_QUERY: Record<ConcernCategory, string> = {
  economy: "inflation OR recession OR cost of living",
  climate: "climate change OR global warming",
  war: "war OR conflict OR Ukraine OR Israel",
  democracy: "democracy OR authoritarianism OR election integrity",
  health: "healthcare OR mental health OR public health",
  ai: "artificial intelligence OR LLM OR ChatGPT OR AI safety",
  loneliness: "loneliness OR isolation OR social connection",
  housing: "housing crisis OR rent OR mortgage",
  inequality: "wealth inequality OR income gap",
  education: "education OR schools OR student loans",
  future: "future of humanity OR existential risk OR collapse",
  other: "",
};

function gdeltCountryQuery(countryName: string): string {
  return `"${countryName}"`;
}

export async function getCountrySignals(
  countryCode: string,
  limit = 10,
): Promise<PublicSignal[]> {
  const country = findCountry(countryCode);
  if (!country) return [];

  const sub = COUNTRY_SUBREDDIT[countryCode];

  // Four parallel sources — Google News RSS is the most reliable from
  // Vercel's IP pool (Reddit/GDELT both have rate-limit / IP issues).
  // Even if 2 of 4 fail, the page still has content.
  const [gnews, gdelt, reddit, hn] = await Promise.all([
    fetchGoogleNews(`"${country.name}"`, 8),
    fetchGdelt(gdeltCountryQuery(country.name), 8),
    sub ? fetchRedditHot(sub, 6) : Promise.resolve([]),
    fetchHN(country.name, 3),
  ]);

  return dedupe(interleave(gnews, reddit, gdelt, hn)).slice(0, limit);
}

export async function getTopicSignals(
  topic: ConcernCategory,
  limit = 12,
): Promise<PublicSignal[]> {
  if (topic === "other") return [];

  const subs = TOPIC_SUBS[topic] ?? [];
  const hnQuery = TOPIC_HN_QUERY[topic];

  const [gnews, hn, ...redditLists] = await Promise.all([
    fetchGoogleNews(hnQuery || topic, 8),
    hnQuery ? fetchHN(hnQuery, 5) : Promise.resolve([]),
    ...subs.map((s) => fetchRedditHot(s, 5)),
  ]);

  return dedupe(interleave(gnews, ...redditLists, hn)).slice(0, limit);
}
