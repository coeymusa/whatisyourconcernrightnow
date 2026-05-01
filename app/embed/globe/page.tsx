import type { Metadata } from "next";
import EmbedClient from "../../components/EmbedClient";
import { fetchRecent, fetchSolutions, hasSupabase } from "../../lib/supabase";
import type {
  Concern,
  ConcernCategory,
  Solution,
} from "../../lib/types";

// Embed-only route. Renders just the 3D globe so blogs, newsrooms, and
// research write-ups can iframe the live record. Bubble clicks open
// /dispatch/[id] in a new tab.
//
// Allowed in iframes: see next.config.mjs headers — frame-ancestors '*' is
// set on /embed/* so cross-origin sites can embed it freely.

export const metadata: Metadata = {
  title: "what is your concern? — embed",
  description:
    "Embeddable live globe of anonymous concerns from around the world.",
  // Don't index the embed in search — it's a widget, not a destination.
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
};

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
  }));
  return { concerns, solutions };
}

export default async function EmbedGlobePage() {
  const { concerns, solutions } = await loadInitial();
  return (
    <>
      {/* Hide the SiteFooter rendered by RootLayout so the iframe is just
          the globe. The footer is the only DOM element outside <main> we
          need to suppress; everything else is already inside the embed. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body > footer { display: none !important; }
            html, body { background: #0a0908; }
          `,
        }}
      />
      <EmbedClient
        initialConcerns={concerns}
        initialSolutions={solutions}
      />
    </>
  );
}
