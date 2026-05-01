"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { findCountry } from "../lib/countries";
import type { Concern } from "../lib/types";

type Props = {
  total: number;
  countries: number;
  latest: Concern | undefined;
  responses: number;
};

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Hero({ total, countries, latest, responses }: Props) {
  // mount guard for time-relative text to avoid SSR drift
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const latestCountry = latest ? findCountry(latest.countryCode)?.name : null;

  return (
    <section className="paper-grain relative isolate overflow-hidden bg-paper text-ink">
      {/* top instrument bar */}
      <div className="border-b border-ink/10 px-5 py-3 sm:px-10">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70 sm:text-xs">
          <div className="flex items-center gap-3">
            <span className="live-dot" aria-hidden />
            <span>Live · global record</span>
          </div>
          <div className="hidden sm:block">
            est. now · vol. I · entry {total.toLocaleString()}
          </div>
          <div>
            {mounted ? new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }) : ""}
          </div>
        </div>
      </div>

      <div className="relative px-5 pt-16 pb-20 sm:px-10 sm:pt-24 sm:pb-28 lg:px-16">
        {/* corner mark */}
        <div className="pointer-events-none absolute right-5 top-6 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 sm:block sm:right-10">
          ◣ no.&nbsp;001 — anon dispatch
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.3, 1] }}
          className="font-serif text-[clamp(3.2rem,11vw,11rem)] italic leading-[0.92] tracking-[-0.01em]"
        >
          what is your<br />
          <span className="not-italic">concern</span>
          <span className="italic">?</span>
          <span className="cursor-blink not-italic" aria-hidden />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-10 max-w-md font-sans text-base leading-relaxed text-ink-mid sm:text-lg"
        >
          A living, anonymous record of what humanity is afraid of. One voice, one
          entry. No names. No accounts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 grid grid-cols-2 gap-6 border-y border-ink/15 py-6 font-mono text-xs uppercase tracking-[0.16em] text-ink/80 sm:grid-cols-4 sm:gap-12 sm:text-sm"
        >
          <Stat label="voices recorded" value={total.toLocaleString()} accent />
          <Stat label="responses given" value={responses.toLocaleString()} amber />
          <Stat label="countries" value={countries.toString()} />
          <Stat label="last entry" value={latest && mounted ? relativeTime(latest.ts) : "—"} small />
        </motion.div>

        <div className="mt-14 flex flex-wrap items-baseline gap-x-8 gap-y-4 font-mono text-xs uppercase tracking-[0.25em]">
          <motion.a
            href="#submit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="group inline-flex items-baseline gap-3 text-ink"
          >
            <span className="relative">
              ↓ add your voice
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-blood transition-transform duration-500 group-hover:scale-x-0" />
            </span>
            <span className="text-ink/40">30 seconds</span>
          </motion.a>

          <motion.a
            href="/pulse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="group inline-flex items-baseline gap-2 text-ink/65 hover:text-ink"
          >
            <span>read the pulse</span>
            <span className="text-blood">→</span>
          </motion.a>

          <motion.a
            href="/world"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="group hidden items-baseline gap-2 text-ink/65 hover:text-ink sm:inline-flex"
          >
            <span>browse by country</span>
            <span className="text-blood">→</span>
          </motion.a>
        </div>
      </div>

      {/* marquee strip */}
      <div className="overflow-hidden border-y border-ink/15 bg-paper-deep">
        <div className="marquee flex whitespace-nowrap py-3 font-mono text-[11px] uppercase tracking-[0.32em] text-ink/70">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-8 px-6">
              {MARQUEE.map((m, j) => (
                <span key={`${i}-${j}`} className="inline-flex items-center gap-8">
                  <span className="text-blood">◆</span>
                  <span>{m}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MARQUEE = [
  "an anonymous record",
  "one person · one voice · one entry",
  "no names · no accounts",
  "the world is listening",
  "what is your concern",
  "a global confession",
  "share what you fear",
  "you are not alone",
];

function Stat({
  label,
  value,
  accent,
  amber,
  small,
}: {
  label: string;
  value: string;
  accent?: boolean;
  amber?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.24em] text-ink/50">{label}</span>
      <span
        className={`font-serif italic ${
          small ? "text-base sm:text-lg" : "text-2xl sm:text-3xl"
        } ${accent ? "text-blood" : amber ? "text-amber" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
