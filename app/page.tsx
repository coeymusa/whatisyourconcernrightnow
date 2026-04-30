"use client";

import { useCallback, useMemo, useState } from "react";
import Hero from "./components/Hero";
import SubmissionForm from "./components/SubmissionForm";
import WorldMap from "./components/WorldMap";
import LiveStream from "./components/LiveStream";
import ResponseFeed from "./components/ResponseFeed";
import ConcernIndex from "./components/ConcernIndex";
import GenerationalDivide from "./components/GenerationalDivide";
import Manifesto from "./components/Manifesto";
import EntryDrawer from "./components/EntryDrawer";
import { useConcernRecord } from "./lib/store";
import type { Concern } from "./lib/types";

export default function Home() {
  const { concerns, solutions, submit, submitSolution } = useConcernRecord();
  const [openConcern, setOpenConcern] = useState<Concern | null>(null);

  const open = useCallback((c: Concern) => setOpenConcern(c), []);
  const close = useCallback(() => setOpenConcern(null), []);

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const c of concerns) s.add(c.countryCode);
    return s.size;
  }, [concerns]);

  const latest = concerns[concerns.length - 1];

  return (
    <main className="bg-paper text-ink">
      <Hero
        total={concerns.length}
        countries={countries}
        latest={latest}
        responses={solutions.length}
      />
      <SubmissionForm onSubmit={submit} serial={concerns.length + 1} />
      <WorldMap concerns={concerns} onOpen={open} />
      <LiveStream concerns={concerns} solutions={solutions} onOpen={open} />
      <ResponseFeed concerns={concerns} solutions={solutions} onOpen={open} />
      <ConcernIndex concerns={concerns} />
      <GenerationalDivide concerns={concerns} />
      <Manifesto />

      <EntryDrawer
        concern={openConcern}
        solutions={solutions}
        onClose={close}
        onSubmitSolution={submitSolution}
      />
    </main>
  );
}
