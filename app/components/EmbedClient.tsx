"use client";

import Globe from "./Globe";
import { useConcernRecord } from "../lib/store";
import type { Concern, Solution } from "../lib/types";

type Props = {
  initialConcerns: Concern[];
  initialSolutions: Solution[];
};

// Embed-mode client. Renders just Globe — no Explore, no Manifesto, no
// EntryDrawer. When a bubble is clicked, the dispatch permalink opens in
// a new tab (parent frame) so the embed stays in place.
export default function EmbedClient({
  initialConcerns,
  initialSolutions,
}: Props) {
  const { concerns, solutions, submit } = useConcernRecord({
    concerns: initialConcerns,
    solutions: initialSolutions,
  });
  const countries = new Set(concerns.map((c) => c.countryCode)).size;

  return (
    <main className="bg-ink text-bone">
      <Globe
        concerns={concerns}
        solutions={solutions}
        totalCountries={countries}
        responses={solutions.length}
        loaded={concerns.length > 0}
        autoRotate={2.5}
        onSubmit={submit}
        onOpen={(c) => {
          if (typeof window !== "undefined") {
            window.open(`/dispatch/${c.id}`, "_blank", "noopener,noreferrer");
          }
        }}
      />
    </main>
  );
}
