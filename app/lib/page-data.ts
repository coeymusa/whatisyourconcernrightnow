import type { Concern, ConcernCategory } from "./types";
import { fetchByCategory, fetchByCountry, hasSupabase } from "./supabase";
import { SEED_CONCERNS } from "./seed";

// When Supabase is configured, we read live rows. When it isn't (local dev,
// fresh deploy), we fall back to the seed dataset filtered by country/topic
// so country and topic pages always have content — never thin or empty.

function rowToConcern(r: {
  id: string;
  age: number;
  bracket: string;
  country_code: string;
  text: string;
  category: string;
  created_at: string;
}): Concern {
  return {
    id: r.id,
    age: r.age,
    bracket: r.bracket as Concern["bracket"],
    countryCode: r.country_code,
    text: r.text,
    category: r.category as ConcernCategory,
    ts: new Date(r.created_at).getTime(),
  };
}

export async function getConcernsByCountry(
  code: string,
  limit = 40,
): Promise<Concern[]> {
  const upper = code.toUpperCase();
  if (hasSupabase()) {
    const rows = await fetchByCountry(upper, limit);
    return rows.map(rowToConcern);
  }
  // Local / preview fallback — show seed entries from this country.
  return SEED_CONCERNS.filter((c) => c.countryCode === upper)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);
}

export async function getConcernsByCategory(
  category: ConcernCategory,
  limit = 40,
): Promise<Concern[]> {
  if (hasSupabase()) {
    const rows = await fetchByCategory(category, limit);
    return rows.map(rowToConcern);
  }
  return SEED_CONCERNS.filter((c) => c.category === category)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);
}
