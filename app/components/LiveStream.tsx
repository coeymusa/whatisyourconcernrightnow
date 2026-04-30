"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Concern } from "../lib/types";
import { findCountry } from "../lib/countries";

type Props = {
  concerns: Concern[];
  solutions?: import("../lib/types").Solution[];
  onOpen?: (concern: Concern) => void;
};

const VISIBLE = 9;

export default function LiveStream({ concerns, solutions = [], onOpen }: Props) {
  const solCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of solutions) m.set(s.concernId, (m.get(s.concernId) ?? 0) + 1);
    return m;
  }, [solutions]);

  // we render only the most recent concerns, with the newest type-on
  const recent = useMemo(
    () => concerns.slice(-VISIBLE).reverse(),
    [concerns],
  );

  // hydration guard — locale-formatted times only appear after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // type-on for newest entry
  const [typed, setTyped] = useState<string>("");
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const newest = recent[0];
    if (!newest) return;
    if (newest.id === lastIdRef.current) return;
    lastIdRef.current = newest.id;
    setTyped("");
    let i = 0;
    const interval = window.setInterval(() => {
      i++;
      setTyped(newest.text.slice(0, i));
      if (i >= newest.text.length) window.clearInterval(interval);
    }, 22);
    return () => window.clearInterval(interval);
  }, [recent]);

  return (
    <section className="paper-grain-dark relative isolate bg-ink-soft py-24 text-bone sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <div className="flex items-end justify-between border-b border-bone/15 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/60">
              § 01 — the wire
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight text-bone sm:text-5xl">
              listening, in real time.
            </h2>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/55 sm:flex">
            <span className="live-dot" /> wire feed
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* left: typewriter newest entry — clickable */}
          <button
            type="button"
            onClick={() => recent[0] && onOpen?.(recent[0])}
            className="group cursor-pointer border border-bone/15 bg-ink p-7 text-left transition hover:border-blood sm:p-10"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood">
              ● incoming · {recent[0] ? findCountry(recent[0].countryCode)?.name : "…"} · age{" "}
              {recent[0]?.age ?? "—"}
            </div>
            <p className="mt-6 min-h-[7rem] font-serif text-3xl italic leading-snug text-bone sm:text-4xl">
              <span>{typed || "—"}</span>
              <span className="feed-caret" />
            </p>
            <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">
              <span>
                entry № {(concerns.length).toString().padStart(6, "0")} · received{" "}
                {mounted && recent[0] ? new Date(recent[0].ts).toLocaleTimeString("en-GB") : "—"}
              </span>
              <span className="text-amber transition group-hover:text-bone">
                offer a response →
              </span>
            </div>
          </button>

          {/* right: scrolling list */}
          <div className="relative overflow-hidden border border-bone/15 bg-ink/60">
            <div className="absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-ink-soft to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-ink-soft to-transparent" />
            <div className="max-h-[26rem] space-y-0 overflow-hidden">
              <AnimatePresence initial={false}>
                {recent.slice(1).map((c) => {
                  const n = solCounts.get(c.id) ?? 0;
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => onOpen?.(c)}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="block w-full cursor-pointer border-b border-bone/10 px-5 py-4 text-left transition hover:bg-blood/10"
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-bone/55">
                        <span>
                          [{findCountry(c.countryCode)?.name ?? c.countryCode} · {c.age}]
                        </span>
                        {n > 0 && (
                          <span className="text-amber">
                            {n} response{n === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 font-mono text-[12.5px] leading-snug text-bone/90">
                        {c.text}
                      </p>
                      {c.original && (
                        <p className="mt-1 font-mono text-[10px] italic leading-snug text-bone/45">
                          {c.original.lang}: “{c.original.text}”
                        </p>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
