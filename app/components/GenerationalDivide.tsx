"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  AGE_BRACKETS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AgeBracket,
  type Concern,
  type ConcernCategory,
} from "../lib/types";

type Props = {
  concerns: Concern[];
};

export default function GenerationalDivide({ concerns }: Props) {
  const matrix = useMemo(() => {
    const m = new Map<AgeBracket, Map<ConcernCategory, number>>();
    for (const b of AGE_BRACKETS) m.set(b, new Map());
    for (const c of concerns) {
      const inner = m.get(c.bracket)!;
      inner.set(c.category, (inner.get(c.category) ?? 0) + 1);
    }
    return m;
  }, [concerns]);

  const totalsByBracket = useMemo(() => {
    const t = new Map<AgeBracket, number>();
    for (const b of AGE_BRACKETS) {
      let n = 0;
      for (const v of matrix.get(b)!.values()) n += v;
      t.set(b, n);
    }
    return t;
  }, [matrix]);

  // for each bracket, find its top 3 concerns
  const tops = useMemo(() => {
    return AGE_BRACKETS.map((b) => {
      const inner = matrix.get(b)!;
      const sorted = [...inner.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
      return { bracket: b, total: totalsByBracket.get(b) ?? 0, top: sorted };
    });
  }, [matrix, totalsByBracket]);

  return (
    <section className="paper-grain relative isolate bg-paper-deep px-5 py-24 text-ink sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between border-b border-ink/15 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/60">
              § 06 — the generational divide
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight sm:text-5xl">
              the young fear differently than the old.
            </h2>
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {tops.map(({ bracket, total, top }, idx) => (
            <motion.div
              key={bracket}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: idx * 0.07 }}
              className="flex flex-col gap-3 border-l border-ink/20 pl-5"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl italic">{bracket}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
                  n = {total}
                </span>
              </div>

              <ul className="mt-2 space-y-3">
                {top.length === 0 && (
                  <li className="font-mono text-xs italic text-ink/40">listening…</li>
                )}
                {top.map(([cat, n], i) => (
                  <li key={cat} className="flex items-baseline justify-between gap-3">
                    <span
                      className={`font-serif italic ${
                        i === 0 ? "text-2xl text-blood" : "text-xl text-ink"
                      }`}
                    >
                      {CATEGORY_LABELS[cat].toLowerCase()}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-ink/55">
                      {((n / Math.max(1, total)) * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>

              {/* spark — top category bar */}
              <div className="mt-3 h-1 w-full bg-paper-shadow">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: total > 0 ? Math.min(1, total / 60) : 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2 + idx * 0.07 }}
                  className="h-full origin-left bg-ink"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-14 max-w-2xl font-serif text-xl italic leading-snug text-ink/85 sm:text-2xl">
          {CATEGORY_ORDER.length} categories. every continent. updated as you read.
        </p>
      </div>
    </section>
  );
}
