"use client";

import { useCallback, useMemo, useState } from "react";
import Globe from "../components/Globe";
import Manifesto from "../components/Manifesto";
import EntryDrawer from "../components/EntryDrawer";
import type { Concern, ConcernCategory } from "../lib/types";
import { ageToBracket } from "../lib/types";
import { DEMO_CONCERNS, DEMO_SOLUTIONS } from "./data";

// /demo — private replay route for screen recording. mirrors the live UI
// but uses curated concerns, auto-spins the globe, and never hits the API.
// noindex is set in layout.tsx.
export default function DemoPage() {
  const [concerns, setConcerns] = useState<Concern[]>(DEMO_CONCERNS);
  const [openConcern, setOpenConcern] = useState<Concern | null>(null);

  const open = useCallback((c: Concern) => setOpenConcern(c), []);
  const close = useCallback(() => setOpenConcern(null), []);

  // local-only submit — never hits the server. lets you record the post
  // flow end-to-end (form → ✓ recorded → share dialog → ping on globe)
  // without leaving traces in the real database.
  const submit = useCallback(
    (input: { age: number; countryCode: string; text: string; category: ConcernCategory }) => {
      const c: Concern = {
        id: `demo-you-${Date.now()}`,
        age: input.age,
        bracket: ageToBracket(input.age),
        countryCode: input.countryCode,
        text: input.text.trim(),
        category: input.category,
        ts: Date.now(),
      };
      setConcerns((prev) => [...prev, c]);
      return c;
    },
    [],
  );

  // solutions are wired through to the drawer but never actually persisted
  const submitSolution = useCallback(() => {
    /* no-op in demo */
  }, []);

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const c of concerns) s.add(c.countryCode);
    return s.size;
  }, [concerns]);

  return (
    <main className="bg-ink text-bone">
      <Globe
        concerns={concerns}
        solutions={DEMO_SOLUTIONS}
        totalCountries={countries}
        responses={DEMO_SOLUTIONS.length}
        loaded={true}
        autoRotate={6}
        bubbleDelay={5000}
        onSubmit={submit}
        onOpen={open}
      />
      <Manifesto />

      <EntryDrawer
        concern={openConcern}
        solutions={DEMO_SOLUTIONS}
        onClose={close}
        onSubmitSolution={submitSolution}
      />
    </main>
  );
}
