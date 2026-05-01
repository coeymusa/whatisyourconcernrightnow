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

  // hydrate user submissions from storage on mount
  useEffect(() => {
    const storedConcerns = loadFromStorage<Concern>(STORAGE_KEY);
    if (storedConcerns.length > 0) setConcerns((c) => [...c, ...storedConcerns]);
    const storedSolutions = loadFromStorage<Solution>(SOL_STORAGE_KEY);
    if (storedSolutions.length > 0) setSolutions((s) => [...s, ...storedSolutions]);
  }, []);

  // poll the API every 20s so submissions from other people show up live.
  // an initial fetch on mount catches anything posted while the page was loading.
  useEffect(() => {
    let cancelled = false;

    function mergeBy<T extends { id: string }>(prev: T[], incoming: T[]): T[] {
      if (incoming.length === 0) return prev;
      const seen = new Set(prev.map((x) => x.id));
      const fresh = incoming.filter((x) => !seen.has(x.id));
      if (fresh.length === 0) return prev;
      return [...prev, ...fresh];
    }

    async function poll() {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch("/api/concerns"),
          fetch("/api/solutions"),
        ]);
        if (cancelled) return;
        const cData = (await cRes.json()) as { concerns?: Concern[] };
        const sData = (await sRes.json()) as { solutions?: Solution[] };
        if (cData.concerns?.length) {
          setConcerns((prev) => mergeBy(prev, cData.concerns!));
        }
        if (sData.solutions?.length) {
          setSolutions((prev) => mergeBy(prev, sData.solutions!));
        }
      } catch {
        /* network blip — try again next tick */
      }
    }

    poll();
    const id = window.setInterval(poll, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
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
      // persist user submission
      const next = [...loadFromStorage<Concern>(STORAGE_KEY), c];
      saveToStorage(STORAGE_KEY, next);
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

  return { concerns, solutions, submit, submitSolution };
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
