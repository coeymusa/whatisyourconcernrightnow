import type { Concern, ConcernCategory } from "./types";
import { fetchByCategory, fetchByCountry, hasSupabase } from "./supabase";

// Anonymous-voices fetchers used by /world/[code] and /topics/[category].
// These return only real user submissions from Supabase. When Supabase
// isn't configured (local dev, fresh deploy), they return [] — pages then
// rely on the public-discourse section to carry the content load.

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
  if (!hasSupabase()) return [];
  const rows = await fetchByCountry(code.toUpperCase(), limit);
  return rows.map(rowToConcern);
}

export async function getConcernsByCategory(
  category: ConcernCategory,
  limit = 40,
): Promise<Concern[]> {
  if (!hasSupabase()) return [];
  const rows = await fetchByCategory(category, limit);
  return rows.map(rowToConcern);
}
