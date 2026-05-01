import HomeClient from "./HomeClient";
import { fetchRecent, fetchSolutions, hasSupabase } from "./lib/supabase";
import type {
  Concern,
  ConcernCategory,
  Solution,
} from "./lib/types";

// Server-rendered shell. Fetches initial concerns + solutions from Supabase
// at request time, hands them to the interactive client. First paint shows
// real numbers (not 0 voices · 0 countries · 0 responses) and the static
// HTML contains real concern text — better for crawlers and first-impression.
export const revalidate = 30;

async function loadInitial(): Promise<{
  concerns: Concern[];
  solutions: Solution[];
}> {
  if (!hasSupabase()) return { concerns: [], solutions: [] };

  const [concernRows, solutionRows] = await Promise.all([
    fetchRecent(200, 0, 0),
    fetchSolutions(200, 0, 0),
  ]);

  const concerns: Concern[] = concernRows.map((r) => ({
    id: r.id,
    age: r.age,
    bracket: r.bracket as Concern["bracket"],
    countryCode: r.country_code,
    text: r.text,
    category: r.category as ConcernCategory,
    ts: new Date(r.created_at).getTime(),
    score: r.score ?? 0,
    upvotes: r.upvotes ?? 0,
    downvotes: r.downvotes ?? 0,
    ...(r.original_lang && r.original_text
      ? { original: { lang: r.original_lang, text: r.original_text } }
      : {}),
  }));

  const solutions: Solution[] = solutionRows.map((r) => ({
    id: r.id,
    concernId: r.concern_id,
    age: r.age,
    bracket: r.bracket as Solution["bracket"],
    countryCode: r.country_code,
    text: r.text,
    ts: new Date(r.created_at).getTime(),
    score: r.score ?? 0,
    upvotes: r.upvotes ?? 0,
    downvotes: r.downvotes ?? 0,
    ...(r.original_lang && r.original_text
      ? { original: { lang: r.original_lang, text: r.original_text } }
      : {}),
  }));

  return { concerns, solutions };
}

export default async function Home() {
  const { concerns, solutions } = await loadInitial();
  return (
    <HomeClient
      initialConcerns={concerns}
      initialSolutions={solutions}
    />
  );
}
