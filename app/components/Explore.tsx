"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COUNTRIES, findCountry } from "../lib/countries";
import {
  AGE_BRACKETS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AgeBracket,
  type Concern,
  type ConcernCategory,
  type Solution,
} from "../lib/types";

type Sort = "newest" | "most-responses";

type Props = {
  concerns: Concern[];
  solutions: Solution[];
  onOpen: (c: Concern) => void;
};

function relTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const VISIBLE_INITIAL = 18;
const VISIBLE_STEP = 18;

export default function Explore({ concerns, solutions, onOpen }: Props) {
  const [cat, setCat] = useState<ConcernCategory | "all">("all");
  const [age, setAge] = useState<AgeBracket | "all">("all");
  const [country, setCountry] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState(VISIBLE_INITIAL);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const responseCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of solutions) m.set(s.concernId, (m.get(s.concernId) ?? 0) + 1);
    return m;
  }, [solutions]);

  // available filter values
  const countriesPresent = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of concerns) m.set(c.countryCode, (m.get(c.countryCode) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [concerns]);

  const categoryCounts = useMemo(() => {
    const m = new Map<ConcernCategory, number>();
    for (const c of concerns) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    return m;
  }, [concerns]);

  const ageCounts = useMemo(() => {
    const m: Record<AgeBracket, number> = {
      "13–19": 0,
      "20–29": 0,
      "30–44": 0,
      "45–59": 0,
      "60+": 0,
    };
    for (const c of concerns) m[c.bracket]++;
    return m;
  }, [concerns]);

  // reset visible when filters change
  useEffect(() => {
    setVisible(VISIBLE_INITIAL);
  }, [cat, age, country, query, sort]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = concerns
      .filter((c) => cat === "all" || c.category === cat)
      .filter((c) => age === "all" || c.bracket === age)
      .filter((c) => country === "all" || c.countryCode === country)
      .filter((c) =>
        q.length === 0
          ? true
          : c.text.toLowerCase().includes(q) ||
            (c.original?.text ?? "").toLowerCase().includes(q),
      );

    if (sort === "newest") {
      arr.sort((a, b) => b.ts - a.ts);
    } else {
      arr.sort(
        (a, b) =>
          (responseCount.get(b.id) ?? 0) - (responseCount.get(a.id) ?? 0) ||
          b.ts - a.ts,
      );
    }
    return arr;
  }, [concerns, cat, age, country, query, sort, responseCount]);

  const showing = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <section
      id="explore"
      className="paper-grain relative isolate bg-paper px-5 py-20 text-ink sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* masthead */}
        <div className="flex flex-col gap-3 border-b border-ink/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/60">
              § 01 — explore the record
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight sm:text-5xl">
              filter by topic, age, country, search.
            </h2>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
            {filtered.length.toLocaleString()} of {concerns.length.toLocaleString()} entries
          </div>
        </div>

        {/* filters */}
        <div className="mt-8 grid gap-6">
          {/* topic chips */}
          <FilterRow
            label="topic"
            options={[
              { value: "all", label: "all topics", count: concerns.length },
              ...CATEGORY_ORDER.filter((c) => (categoryCounts.get(c) ?? 0) > 0).map(
                (c) => ({
                  value: c,
                  label: CATEGORY_LABELS[c].toLowerCase(),
                  count: categoryCounts.get(c) ?? 0,
                }),
              ),
            ]}
            value={cat}
            onChange={(v) => setCat(v as ConcernCategory | "all")}
          />

          {/* age chips */}
          <FilterRow
            label="age"
            options={[
              { value: "all", label: "all ages", count: concerns.length },
              ...AGE_BRACKETS.map((b) => ({
                value: b,
                label: b,
                count: ageCounts[b],
              })),
            ]}
            value={age}
            onChange={(v) => setAge(v as AgeBracket | "all")}
          />

          {/* country + search + sort row */}
          <div className="flex flex-col items-stretch gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                country
              </span>
              <select
                className="dotted-input w-full font-serif text-xl italic sm:w-72"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="all">all countries</option>
                {countriesPresent.map(([code, n]) => {
                  const c = findCountry(code);
                  if (!c) return null;
                  return (
                    <option key={code} value={code}>
                      {c.name} ({n})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                search
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="a word, a phrase…"
                className="dotted-input w-full font-serif text-xl italic"
                style={{ textAlign: "left" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                sort
              </span>
              <div className="flex gap-1">
                <SortPill
                  active={sort === "newest"}
                  onClick={() => setSort("newest")}
                  label="newest"
                />
                <SortPill
                  active={sort === "most-responses"}
                  onClick={() => setSort("most-responses")}
                  label="most responses"
                />
              </div>
            </div>
          </div>

          {/* clear */}
          {(cat !== "all" || age !== "all" || country !== "all" || query) && (
            <button
              onClick={() => {
                setCat("all");
                setAge("all");
                setCountry("all");
                setQuery("");
              }}
              className="self-start font-mono text-[10px] uppercase tracking-[0.22em] text-blood underline-offset-4 hover:underline"
            >
              clear all filters
            </button>
          )}
        </div>

        {/* the wall */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {showing.map((c, i) => {
              const respN = responseCount.get(c.id) ?? 0;
              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(i * 0.015, 0.25),
                  }}
                >
                  <button
                    onClick={() => onOpen(c)}
                    className="group flex h-full w-full flex-col gap-3 border border-ink/10 bg-paper-deep p-5 text-left transition hover:border-ink hover:bg-bone"
                  >
                    <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      <span className="text-blood">
                        {findCountry(c.countryCode)?.name ?? c.countryCode}
                      </span>
                      <span>age {c.age}</span>
                    </div>
                    <p className="font-serif text-xl italic leading-snug text-ink sm:text-[1.4rem]">
                      “{c.text}”
                    </p>
                    {c.original && (
                      <p className="font-mono text-[10px] italic leading-relaxed text-ink/45">
                        {c.original.lang}: “{c.original.text}”
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      <span>{CATEGORY_LABELS[c.category].toLowerCase()}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-amber">
                          {respN} response{respN === 1 ? "" : "s"}
                        </span>
                        <span className="text-ink/35">
                          {mounted ? relTime(c.ts) : "—"} ago
                        </span>
                      </span>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {filtered.length === 0 && (
          <p className="mt-12 font-serif text-2xl italic text-ink/55">
            nothing here yet — try a different filter, or be the first.
          </p>
        )}

        {canLoadMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + VISIBLE_STEP)}
              className="border border-ink/25 bg-paper px-8 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
            >
              load {Math.min(VISIBLE_STEP, filtered.length - visible)} more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[5rem_1fr] sm:gap-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`group inline-flex items-baseline gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/25 text-ink/65 hover:border-ink hover:text-ink"
              }`}
            >
              {o.label}
              {o.count !== undefined && (
                <span
                  className={`tabular-nums text-[9px] ${
                    active ? "text-paper/70" : "text-ink/40"
                  }`}
                >
                  {o.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
        active
          ? "border-blood bg-blood text-paper"
          : "border-ink/25 text-ink/65 hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

void COUNTRIES;
