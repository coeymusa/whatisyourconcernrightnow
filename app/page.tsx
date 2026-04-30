"use client";

import { useMemo } from "react";
import Hero from "./components/Hero";
import SubmissionForm from "./components/SubmissionForm";
import WorldMap from "./components/WorldMap";
import LiveStream from "./components/LiveStream";
import ConcernIndex from "./components/ConcernIndex";
import GenerationalDivide from "./components/GenerationalDivide";
import Manifesto from "./components/Manifesto";
import { useConcernRecord } from "./lib/store";

export default function Home() {
  const { concerns, submit } = useConcernRecord();

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const c of concerns) s.add(c.countryCode);
    return s.size;
  }, [concerns]);

  const latest = concerns[concerns.length - 1];

  return (
    <main className="bg-paper text-ink">
      <Hero total={concerns.length} countries={countries} latest={latest} />
      <SubmissionForm onSubmit={submit} serial={concerns.length + 1} />
      <WorldMap concerns={concerns} />
      <LiveStream concerns={concerns} />
      <ConcernIndex concerns={concerns} />
      <GenerationalDivide concerns={concerns} />
      <Manifesto />
    </main>
  );
}
