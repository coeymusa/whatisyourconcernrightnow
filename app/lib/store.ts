"use client";

import { useEffect, useState, useCallback } from "react";
import type { Concern, ConcernCategory } from "./types";
import { ageToBracket } from "./types";
import { SEED_CONCERNS, STREAM_FRAGMENTS } from "./seed";

const STORAGE_KEY = "concern.submissions.v1";

function loadUserSubmissions(): Concern[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return [];
}

function saveUserSubmissions(items: Concern[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-200)));
  } catch {
    /* ignore */
  }
}

/**
 * The "global record" — seed + ambient synthetic arrivals + user submissions.
 * Synthetic arrivals are appended periodically to give the page the feel of
 * being populated by a live, anonymous stream from around the world.
 */
export function useConcernRecord() {
  const [concerns, setConcerns] = useState<Concern[]>(() => SEED_CONCERNS);
  const [userSubmissions, setUserSubmissions] = useState<Concern[]>([]);

  // hydrate user submissions from storage on mount
  useEffect(() => {
    const stored = loadUserSubmissions();
    if (stored.length > 0) {
      setUserSubmissions(stored);
      setConcerns((c) => [...c, ...stored]);
    }
  }, []);

  // ambient stream — adds a "discovered" concern every 5–10s
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const tick = () => {
      if (cancelled) return;
      const frag = STREAM_FRAGMENTS[Math.floor(Math.random() * STREAM_FRAGMENTS.length)];
      const c: Concern = {
        id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        age: frag.age,
        bracket: ageToBracket(frag.age),
        countryCode: frag.countryCode,
        text: frag.text,
        category: frag.category,
        ts: Date.now(),
      };
      setConcerns((prev) => [...prev, c]);
      const nextDelay = 4500 + Math.random() * 6000;
      timer = window.setTimeout(tick, nextDelay);
    };

    timer = window.setTimeout(tick, 3500);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
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
      setUserSubmissions((prev) => {
        const next = [...prev, c];
        saveUserSubmissions(next);
        return next;
      });
      return c;
    },
    [],
  );

  return { concerns, userSubmissions, submit };
}

// classify a free-text concern into a category by keyword sniffing.
// good enough for an MVP — the real version uses an embedding classifier server-side.
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
