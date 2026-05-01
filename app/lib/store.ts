"use client";

import { useEffect, useState, useCallback } from "react";
import type { Concern, ConcernCategory, Solution } from "./types";
import { ageToBracket } from "./types";

const STORAGE_KEY = "concern.submissions.v1";
const SOL_STORAGE_KEY = "concern.solutions.v1";

function loadFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveToStorage<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(-200)));
  } catch {
    /* ignore */
  }
}

/**
 * The "global record" — seed + ambient synthetic arrivals + user submissions.
 * Includes both concerns and solutions; the page is one shared timeline.
 */
export function useConcernRecord() {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  // tracks whether the very first poll has completed — so the UI can
  // hold off rendering the 'the record is empty' empty state until we
  // actually know it's empty (rather than showing it during the brief
  // initial-load window before the first fetch lands)
  const [loaded, setLoaded] = useState(false);

  // hydrate user submissions from storage on mount
  useEffect(() => {
    const storedConcerns = loadFromStorage<Concern>(STORAGE_KEY);
    if (storedConcerns.length > 0) setConcerns((c) => [...c, ...storedConcerns]);
    const storedSolutions = loadFromStorage<Solution>(SOL_STORAGE_KEY);
    if (storedSolutions.length > 0) setSolutions((s) => [...s, ...storedSolutions]);
  }, []);

  // Live polling — efficient version.
  //   • Tracks the latest seen ts per stream and sends ?since=<ts>, so
  //     after the initial load we usually get back an empty array.
  //   • Pauses while the tab is hidden so backgrounded tabs cost nothing.
  //   • Exponential backoff on errors (20s → 40 → 80 → … capped at 5min).
  //   • Server response is edge-cached for 10s, so all clients in a region
  //     hit Supabase at most ~once per 10s window between them.
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    let backoff = 20_000;
    const MAX_BACKOFF = 5 * 60 * 1000;
    const sinceConcerns = { current: 0 };
    const sinceSolutions = { current: 0 };

    function mergeBy<T extends { id: string }>(prev: T[], incoming: T[]): T[] {
      if (incoming.length === 0) return prev;
      const seen = new Set(prev.map((x) => x.id));
      const fresh = incoming.filter((x) => !seen.has(x.id));
      if (fresh.length === 0) return prev;
      return [...prev, ...fresh];
    }

    async function pollOnce() {
      if (cancelled) return;
      // skip while the tab is hidden — saves bandwidth + Supabase reads
      if (typeof document !== "undefined" && document.hidden) return;

      const cUrl = sinceConcerns.current
        ? `/api/concerns?since=${sinceConcerns.current}`
        : "/api/concerns";
      const sUrl = sinceSolutions.current
        ? `/api/solutions?since=${sinceSolutions.current}`
        : "/api/solutions";

      const [cRes, sRes] = await Promise.all([fetch(cUrl), fetch(sUrl)]);
      if (cancelled) return;

      const cData = (await cRes.json()) as { concerns?: Concern[] };
      const sData = (await sRes.json()) as { solutions?: Solution[] };

      if (cData.concerns?.length) {
        setConcerns((prev) => mergeBy(prev, cData.concerns!));
        sinceConcerns.current = Math.max(
          sinceConcerns.current,
          ...cData.concerns.map((c) => c.ts),
        );
      }
      if (sData.solutions?.length) {
        setSolutions((prev) => mergeBy(prev, sData.solutions!));
        sinceSolutions.current = Math.max(
          sinceSolutions.current,
          ...sData.solutions.map((s) => s.ts),
        );
      }
    }

    function schedule(delay: number) {
      if (cancelled) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(loop, delay);
    }

    async function loop() {
      try {
        await pollOnce();
        backoff = 20_000; // recovered — reset
      } catch {
        backoff = Math.min(backoff * 2, MAX_BACKOFF);
      } finally {
        // first poll completed (success or failure) — let the UI show
        // empty/loaded state instead of flashing the empty-state cue
        if (!cancelled) setLoaded(true);
        schedule(backoff);
      }
    }

    function onVisibility() {
      if (!document.hidden) loop(); // poll immediately when user returns
    }

    loop();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, []);

  const submit = useCallback(
    (input: { age: number; countryCode: string; text: string; category: ConcernCategory }) => {
      const c: Concern = {
        id: `you-${Date.now()}`,
        age: input.age,
        bracket: ageToBracket(input.age),
        countryCode: input.countryCode,
        text: input.text.trim(),
        category: input.category,
        ts: Date.now(),
      };
      setConcerns((prev) => [...prev, c]);
      // persist user submission to localStorage (instant restore on reload)
      const next = [...loadFromStorage<Concern>(STORAGE_KEY), c];
      saveToStorage(STORAGE_KEY, next);
      // and to the server so other devices / browsers / users can see it
      if (typeof window !== "undefined") {
        fetch("/api/concerns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }).catch(() => {});
      }
      return c;
    },
    [],
  );

  const submitSolution = useCallback(
    (input: { concernId: string; age: number; countryCode: string; text: string }) => {
      const s: Solution = {
        id: `you-sol-${Date.now()}`,
        concernId: input.concernId,
        age: input.age,
        bracket: ageToBracket(input.age),
        countryCode: input.countryCode,
        text: input.text.trim(),
        ts: Date.now(),
      };
      setSolutions((prev) => [...prev, s]);
      const next = [...loadFromStorage<Solution>(SOL_STORAGE_KEY), s];
      saveToStorage(SOL_STORAGE_KEY, next);
      // best-effort persistence
      if (typeof window !== "undefined") {
        fetch("/api/solutions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }).catch(() => {});
      }
      return s;
    },
    [],
  );

  // Pagination — fetch concerns older than the oldest one currently shown.
  // Returns the count of newly added rows so the caller knows whether more
  // pages are available.
  const loadOlder = useCallback(
    async (pageSize = 30): Promise<number> => {
      // pick the oldest ts we already have in state
      let oldest = Infinity;
      for (const c of concerns) {
        if (c.ts < oldest) oldest = c.ts;
      }
      const before = Number.isFinite(oldest) ? oldest : Date.now();
      try {
        const r = await fetch(
          `/api/concerns?before=${before}&limit=${pageSize}`,
        );
        if (!r.ok) return 0;
        const data = (await r.json()) as { concerns?: Concern[] };
        if (!data.concerns?.length) return 0;
        const seen = new Set(concerns.map((c) => c.id));
        const fresh = data.concerns.filter((c) => !seen.has(c.id));
        if (fresh.length === 0) return 0;
        setConcerns((prev) => [...prev, ...fresh]);
        return fresh.length;
      } catch {
        return 0;
      }
    },
    [concerns],
  );

  return { concerns, solutions, submit, submitSolution, loadOlder, loaded };
}

// classify a free-text concern into a category by keyword sniffing.
const KEYWORDS: Record<ConcernCategory, RegExp> = {
  economy: /\b(rent|salary|wage|price|inflation|economy|jobs?|cost|afford|money|currency|dollar|euro|peso|lira|cedi)/i,
  climate: /\b(climate|fire|flood|heat|drought|warming|carbon|water|monsoon|typhoon|storm|smoke|glacier|ice|sea level|biodiversity|bees?|river)/i,
  war: /\b(war|violence|shoot|gun|bomb|missile|sirens?|invasion|genocide|attack|murder|cartel|gang)/i,
  democracy: /\b(democracy|election|vote|right wing|far right|fascis|authoritarian|dictator|protest|press freedom|censor|polari[sz]ed|government|regime|state)/i,
  health: /\b(hospital|nhs|clinic|doctor|nurse|cancer|mental health|depression|anxiety|medication|sick|disease|pandemic|covid)/i,
  ai: /\b(ai|algorithm|chatgpt|model|automated?|robots?|deepfake|fake|whatsapp|misinformation)/i,
  loneliness: /\b(lonely|alone|isolat|friend|community|meaning|empty|nothing|disconnected|social media)/i,
  housing: /\b(rent|mortgage|landlord|housing|home|apartment|flat|own (a|my)|buy a house)/i,
  inequality: /\b(inequalit|rich|poor|class|caste|race|racis|discrimina|wealth|gap)/i,
  education: /\b(school|teacher|student|university|college|education|kids?|children)/i,
  future: /\b(future|tomorrow|kids?|children|next generation|hope|despair|outlook)/i,
  other: /.^/, // never matches
};

export function classify(text: string): ConcernCategory {
  for (const k of [
    "war",
    "climate",
    "democracy",
    "ai",
    "housing",
    "economy",
    "health",
    "inequality",
    "loneliness",
    "education",
    "future",
  ] as ConcernCategory[]) {
    if (KEYWORDS[k].test(text)) return k;
  }
  return "other";
}
