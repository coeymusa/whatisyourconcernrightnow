"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { CATEGORY_LABELS, CATEGORY_ORDER, type Concern, type ConcernCategory } from "../lib/types";

type Props = {
  concerns: Concern[];
};

export default function ConcernIndex({ concerns }: Props) {
  const ranked = useMemo(() => {
    const m = new Map<ConcernCategory, number>();
    for (const c of concerns) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    return CATEGORY_ORDER.map((c) => ({ key: c, count: m.get(c) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [concerns]);

  const total = concerns.length || 1;
  const max = ranked[0]?.count || 1;

  return (
    <section className="paper-grain relative isolate bg-paper px-5 py-24 text-ink sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between border-b border-ink/15 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/60">
              § 06 — the index
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight sm:text-5xl">
              what we are afraid of, ranked.
            </h2>
          </div>
          <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 sm:block">
            of {total.toLocaleString()} voices
          </div>
        </div>

        <ol className="mt-12 space-y-3">
          {ranked.map((row, i) => (
            <Row
              key={row.key}
              rank={i + 1}
              label={CATEGORY_LABELS[row.key]}
              count={row.count}
              pct={row.count / total}
              widthFactor={row.count / max}
              isFirst={i === 0}
            />
          ))}
        </ol>

        <p className="mt-12 max-w-2xl font-serif text-xl italic leading-snug text-ink/85 sm:text-2xl">
          there is a shape to the global mood. read it slowly. it is also you.
        </p>
      </div>
    </section>
  );
}

function Row({
  rank,
  label,
  count,
  pct,
  widthFactor,
  isFirst,
}: {
  rank: number;
  label: string;
  count: number;
  pct: number;
  widthFactor: number;
  isFirst?: boolean;
}) {
  return (
    <li className="grid grid-cols-[2.2rem_minmax(0,1fr)_4.5rem_5rem] items-center gap-4 border-b border-ink/10 py-3">
      <span className="font-mono text-xs tabular-nums text-ink/45">
        {rank.toString().padStart(2, "0")}
      </span>
      <span className="flex items-center gap-3">
        <span
          className={`font-serif italic ${
            isFirst ? "text-3xl text-blood" : "text-2xl text-ink"
          }`}
        >
          {label.toLowerCase()}
        </span>
      </span>
      <div className="relative h-3 overflow-hidden bg-paper-shadow">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: widthFactor }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.3, 1] }}
          className={`absolute inset-y-0 left-0 origin-left ${
            isFirst ? "bg-blood" : "bg-ink"
          }`}
          style={{ width: "100%" }}
        />
      </div>
      <span className="text-right font-mono text-xs tabular-nums text-ink/70">
        {(pct * 100).toFixed(1)}% · {count}
      </span>
    </li>
  );
}
