"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COUNTRIES } from "../lib/countries";
import type { ConcernCategory } from "../lib/types";
import { classify } from "../lib/store";
import { guessCountry, isValidCountry, loadPrefs, savePrefs } from "../lib/ux";

const MAX = 240;

type Props = {
  onSubmit: (input: {
    age: number;
    countryCode: string;
    text: string;
    category: ConcernCategory;
  }) => void;
};

export default function QuickAdd({ onSubmit }: Props) {
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // hydrate prefs once mounted
  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.age) setAge(String(prefs.age));
    if (prefs.countryCode && isValidCountry(prefs.countryCode)) {
      setCountry(prefs.countryCode);
    } else {
      const guessed = guessCountry();
      if (guessed) setCountry(guessed);
    }
  }, []);

  const ageNum = Number(age);
  const valid =
    ageNum >= 13 &&
    ageNum <= 120 &&
    country.length === 2 &&
    text.trim().length >= 4 &&
    text.length <= MAX;

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!valid) return;
    const cat = classify(text);
    onSubmit({ age: ageNum, countryCode: country, text, category: cat });
    savePrefs({ age: ageNum, countryCode: country });
    setText("");
    setDone(true);
    window.setTimeout(() => setDone(false), 2400);
    inputRef.current?.blur();
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass relative flex w-full flex-col gap-3 border-t border-bone/10 px-5 py-4 sm:px-10 sm:py-5"
    >
      {/* identity row */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-serif text-base italic text-bone/85 sm:text-lg">
        <span>I'm</span>
        <input
          className="dotted-input-dark w-14 font-serif italic"
          placeholder="age"
          inputMode="numeric"
          pattern="[0-9]*"
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
          aria-label="age"
        />
        <span>in</span>
        <select
          className="dotted-input-dark w-44 cursor-pointer appearance-none font-serif italic"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          aria-label="country"
        >
          <option value="">your country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <span>—</span>
      </div>

      {/* the line */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <textarea
          ref={inputRef}
          rows={1}
          onKeyDown={onKey}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="what's on your mind, right now?"
          className="dotted-input-dark grow font-serif text-2xl italic leading-snug placeholder:italic sm:text-3xl"
          aria-label="your concern"
        />
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
            {text.length}/{MAX} · ⏎ post
          </span>
          <button
            type="submit"
            disabled={!valid}
            className="group relative inline-flex items-center gap-2 bg-blood px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-bone hover:text-blood"
          >
            post anonymously
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      {/* confirmation toast */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -top-12 right-5 z-30 border border-amber/50 bg-ink-soft/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-amber backdrop-blur"
          >
            ✓ recorded · your dot is on the map
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
