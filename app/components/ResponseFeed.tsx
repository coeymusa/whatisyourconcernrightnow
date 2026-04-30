"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { Concern, Solution } from "../lib/types";
import { findCountry } from "../lib/countries";

type Props = {
  concerns: Concern[];
  solutions: Solution[];
  onOpen?: (concern: Concern) => void;
};

export default function ResponseFeed({ concerns, solutions, onOpen }: Props) {
  const concernMap = useMemo(() => {
    const m = new Map<string, Concern>();
    for (const c of concerns) m.set(c.id, c);
    return m;
  }, [concerns]);

  const recent = useMemo(
    () => [...solutions].sort((a, b) => b.ts - a.ts).slice(0, 9),
    [solutions],
  );

  return (
    <section className="paper-grain relative isolate bg-paper px-5 py-24 text-ink sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between border-b border-ink/15 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/60">
              § 02 — the response
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight sm:text-5xl">
              <span className="text-amber">solidarity. perspective. practice.</span>
            </h2>
          </div>
          <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 sm:block">
            {solutions.length.toLocaleString()} responses · click any concern to add yours
          </div>
        </div>

        <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((s, idx) => {
            const c = concernMap.get(s.concernId);
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.55, delay: idx * 0.05 }}
                className="group flex flex-col"
              >
                {/* concern stub (clickable to open) */}
                {c && (
                  <button
                    type="button"
                    onClick={() => onOpen?.(c)}
                    className="text-left"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blood">
                      ◆ concern · {findCountry(c.countryCode)?.name ?? c.countryCode} · age {c.age}
                    </div>
                    <p className="mt-2 font-serif text-lg italic leading-snug text-ink/70 transition group-hover:text-ink">
                      “{c.text}”
                    </p>
                    {c.original && (
                      <p className="mt-1 font-mono text-[10px] italic text-ink/45">
                        {c.original.lang}: “{c.original.text}”
                      </p>
                    )}
                  </button>
                )}
                {/* the response */}
                <div className="mt-4 border-l-2 border-amber pl-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                    response · {findCountry(s.countryCode)?.name ?? s.countryCode} · age {s.age}
                  </div>
                  <p className="mt-2 font-serif text-xl italic leading-snug text-ink sm:text-2xl">
                    “{s.text}”
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>

        {recent.length === 0 && (
          <p className="mt-12 font-serif text-xl italic text-ink/60">
            no responses yet. the wire is open.
          </p>
        )}
      </div>
    </section>
  );
}
