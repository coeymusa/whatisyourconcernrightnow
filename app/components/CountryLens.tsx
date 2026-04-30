"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { findCountry } from "../lib/countries";
import {
  AGE_BRACKETS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AgeBracket,
  type Concern,
  type ConcernCategory,
  type Solution,
} from "../lib/types";

type Props = {
  open: boolean;
  selectedCountry: string | null;
  concerns: Concern[];
  solutions: Solution[];
  onSelectCountry: (code: string | null) => void;
  onClose: () => void;
  onOpenConcern: (c: Concern) => void;
};

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function CountryLens({
  open,
  selectedCountry,
  concerns,
  solutions,
  onSelectCountry,
  onClose,
  onOpenConcern,
}: Props) {
  const [catFilter, setCatFilter] = useState<ConcernCategory | "all">("all");
  const [ageFilter, setAgeFilter] = useState<AgeBracket | "all">("all");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // reset filters when changing country
  useEffect(() => {
    setCatFilter("all");
    setAgeFilter("all");
  }, [selectedCountry]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const country = selectedCountry ? findCountry(selectedCountry) : null;

  const countryConcerns = useMemo(
    () => concerns.filter((c) => c.countryCode === selectedCountry),
    [concerns, selectedCountry],
  );

  const responseCount = useMemo(() => {
    const ids = new Set(countryConcerns.map((c) => c.id));
    return solutions.filter((s) => ids.has(s.concernId)).length;
  }, [solutions, countryConcerns]);

  const ageDistribution = useMemo(() => {
    const m: Record<AgeBracket, number> = {
      "13–19": 0,
      "20–29": 0,
      "30–44": 0,
      "45–59": 0,
      "60+": 0,
    };
    for (const c of countryConcerns) m[c.bracket]++;
    return m;
  }, [countryConcerns]);

  const categoryCounts = useMemo(() => {
    const m = new Map<ConcernCategory, number>();
    for (const c of countryConcerns) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    return m;
  }, [countryConcerns]);

  const topCategory = useMemo(
    () =>
      [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    [categoryCounts],
  );

  const filtered = useMemo(
    () =>
      countryConcerns
        .filter((c) => catFilter === "all" || c.category === catFilter)
        .filter((c) => ageFilter === "all" || c.bracket === ageFilter)
        .sort((a, b) => b.ts - a.ts),
    [countryConcerns, catFilter, ageFilter],
  );

  const top = countryConcerns.length;
  const maxAge = Math.max(1, ...Object.values(ageDistribution));

  return (
    <AnimatePresence>
      {open && country && (
        <>
          {/* mobile-only backdrop (tap to close) */}
          <motion.div
            key="lens-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/55 backdrop-blur-[2px] sm:hidden"
            aria-hidden
          />

          <motion.aside
            key="lens"
            role="dialog"
            aria-modal="true"
            aria-label={`${country.name} dossier`}
            initial={{ x: "100%", y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
            className="
              fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-bone/10
              bg-paper text-ink shadow-[ -24px_0_60px_-30px_rgba(0,0,0,0.7) ]
              sm:max-w-[44rem]
            "
          >
            {/* top bar */}
            <div className="flex items-center justify-between border-b border-ink/15 bg-paper-deep/80 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/70 backdrop-blur">
              <button
                onClick={onClose}
                className="text-ink/65 transition hover:text-blood"
              >
                ← back to the planet
              </button>
              <span className="hidden sm:inline">country lens · ESC to close</span>
              <span className="sm:hidden">esc</span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 sm:py-10">
              {/* country name */}
              <div className="border-b border-ink/15 pb-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                  § dossier · {selectedCountry}
                </div>
                <h2 className="mt-3 font-serif text-5xl italic leading-[0.95] sm:text-6xl">
                  {country.name.toLowerCase()},<br />
                  <span className="text-blood not-italic"> right now.</span>
                </h2>
              </div>

              {/* stats */}
              <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-b border-ink/15 pb-8 sm:grid-cols-3">
                <Stat label="voices" value={top.toLocaleString()} accent="blood" />
                <Stat
                  label="responses"
                  value={responseCount.toLocaleString()}
                  accent="amber"
                />
                <Stat
                  label="loudest concern"
                  value={
                    topCategory
                      ? CATEGORY_LABELS[topCategory].toLowerCase()
                      : "—"
                  }
                  small
                />
                <div className="col-span-2 sm:col-span-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/45">
                    age distribution
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    {AGE_BRACKETS.map((b) => {
                      const v = ageDistribution[b];
                      const h = Math.max(2, Math.round((v / maxAge) * 38));
                      return (
                        <button
                          key={b}
                          onClick={() => setAgeFilter(ageFilter === b ? "all" : b)}
                          className="group flex flex-1 flex-col items-center gap-1.5"
                        >
                          <div
                            className={`w-full ${
                              ageFilter === b ? "bg-blood" : "bg-ink/80 group-hover:bg-blood"
                            }`}
                            style={{ height: `${h}px` }}
                          />
                          <span
                            className={`font-mono text-[9px] tracking-[0.18em] ${
                              ageFilter === b ? "text-blood" : "text-ink/45 group-hover:text-ink"
                            }`}
                          >
                            {b}
                          </span>
                          <span
                            className={`font-mono text-[9px] tabular-nums ${
                              ageFilter === b ? "text-blood" : "text-ink/35"
                            }`}
                          >
                            {v}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* topic filter */}
              <div className="mt-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">
                  filter by topic
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip
                    active={catFilter === "all"}
                    onClick={() => setCatFilter("all")}
                    label="all"
                    count={top}
                  />
                  {CATEGORY_ORDER.filter((c) => (categoryCounts.get(c) ?? 0) > 0).map(
                    (c) => (
                      <Chip
                        key={c}
                        active={catFilter === c}
                        onClick={() => setCatFilter(catFilter === c ? "all" : c)}
                        label={CATEGORY_LABELS[c].toLowerCase()}
                        count={categoryCounts.get(c) ?? 0}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* entries */}
              <div className="mt-10">
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">
                    latest · {filtered.length}{" "}
                    {filtered.length === 1 ? "entry" : "entries"}
                  </div>
                  {(catFilter !== "all" || ageFilter !== "all") && (
                    <button
                      onClick={() => {
                        setCatFilter("all");
                        setAgeFilter("all");
                      }}
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 underline-offset-4 hover:text-blood hover:underline"
                    >
                      clear filters
                    </button>
                  )}
                </div>

                <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/15">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filtered.slice(0, 30).map((c, i) => {
                      const respCount = solutions.filter(
                        (s) => s.concernId === c.id,
                      ).length;
                      return (
                        <motion.li
                          key={c.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2) }}
                        >
                          <button
                            onClick={() => onOpenConcern(c)}
                            className="group grid w-full grid-cols-[2.4rem_1fr] items-start gap-4 py-5 text-left transition hover:bg-paper-deep sm:grid-cols-[3rem_1fr_auto] sm:gap-6"
                          >
                            <span className="font-mono text-2xl tabular-nums italic text-ink/40 transition group-hover:text-blood sm:text-3xl">
                              {c.age}
                            </span>
                            <div>
                              <p className="font-serif text-xl italic leading-snug text-ink sm:text-2xl">
                                “{c.text}”
                              </p>
                              {c.original && (
                                <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink/45">
                                  <span className="uppercase tracking-[0.18em] text-ink/30">
                                    {c.original.lang}:{" "}
                                  </span>
                                  <span className="italic">“{c.original.text}”</span>
                                </p>
                              )}
                            </div>
                            <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 sm:col-span-1 sm:flex-col sm:items-end">
                              <span>{CATEGORY_LABELS[c.category].toLowerCase()}</span>
                              <span className="text-amber">
                                {respCount} response{respCount === 1 ? "" : "s"}
                              </span>
                              <span className="text-ink/35">
                                {mounted ? relativeTime(c.ts) : "—"} ago
                              </span>
                            </div>
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                {filtered.length === 0 && (
                  <p className="mt-6 font-serif text-lg italic text-ink/55">
                    no entries match this filter — try another.
                  </p>
                )}
              </div>

              {/* country switcher */}
              <CountrySwitcher
                concerns={concerns}
                selected={selectedCountry}
                onSelect={onSelectCountry}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: "blood" | "amber";
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/45">
        {label}
      </span>
      <span
        className={`font-serif italic ${
          small ? "text-base sm:text-lg" : "text-3xl sm:text-4xl"
        } ${accent === "blood" ? "text-blood" : accent === "amber" ? "text-amber" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-baseline gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/25 text-ink/70 hover:border-ink hover:text-ink"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`tabular-nums text-[9px] ${
            active ? "text-paper/70" : "text-ink/40"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CountrySwitcher({
  concerns,
  selected,
  onSelect,
}: {
  concerns: Concern[];
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  const ranked = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of concerns) m.set(c.countryCode, (m.get(c.countryCode) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [concerns]);

  return (
    <div className="mt-12 border-t border-ink/15 pt-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">
        listen to another country
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {ranked.slice(0, 24).map(([code, n]) => {
          const country = findCountry(code);
          if (!country) return null;
          const active = code === selected;
          return (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className={`group inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                active
                  ? "border-blood bg-blood text-paper"
                  : "border-ink/25 text-ink/70 hover:border-ink hover:text-ink"
              }`}
            >
              {country.name.toLowerCase()}
              <span
                className={`tabular-nums ${
                  active ? "text-paper/85" : "text-ink/40"
                }`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
