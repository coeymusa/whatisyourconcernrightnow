"use client";

import { useCallback, useMemo, useState } from "react";
import Globe from "./components/Globe";
import Explore from "./components/Explore";
import Manifesto from "./components/Manifesto";
import EntryDrawer from "./components/EntryDrawer";
import { useConcernRecord } from "./lib/store";
import type { Concern, Solution } from "./lib/types";

type Props = {
  initialConcerns: Concern[];
  initialSolutions: Solution[];
};

export default function HomeClient({
  initialConcerns,
  initialSolutions,
}: Props) {
  const { concerns, solutions, submit, submitSolution, loadOlder, loaded } =
    useConcernRecord({
      concerns: initialConcerns,
      solutions: initialSolutions,
    });
  const [openConcern, setOpenConcern] = useState<Concern | null>(null);

  const open = useCallback((c: Concern) => setOpenConcern(c), []);
  const close = useCallback(() => setOpenConcern(null), []);

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const c of concerns) s.add(c.countryCode);
    return s.size;
  }, [concerns]);

  return (
    <main className="bg-ink text-bone">
      <Globe
        concerns={concerns}
        solutions={solutions}
        totalCountries={countries}
        responses={solutions.length}
        loaded={loaded}
        autoRotate={2.5}
        onSubmit={submit}
        onOpen={open}
      />
      <Explore
        concerns={concerns}
        solutions={solutions}
        onOpen={open}
        loadOlder={loadOlder}
      />
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
