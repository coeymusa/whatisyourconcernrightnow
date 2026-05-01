"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COUNTRIES } from "../lib/countries";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ConcernCategory } from "../lib/types";
import { classify } from "../lib/store";
import TurnstileWidget from "./TurnstileWidget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Submitted = {
  text: string;
  age: number;
  countryCode: string;
  category: ConcernCategory;
  serial: number;
};

type Props = {
  onSubmit: (input: {
    age: number;
    countryCode: string;
    text: string;
    category: ConcernCategory;
  }) => void;
  serial: number;
};

const MAX_LENGTH = 240;

export default function SubmissionForm({ onSubmit, serial }: Props) {
  const [age, setAge] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [category, setCategory] = useState<ConcernCategory | "">("");
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const detected = useMemo<ConcernCategory>(() => classify(text || ""), [text]);
  const finalCategory: ConcernCategory = (category || detected) as ConcernCategory;
  const handleToken = useCallback((t: string) => setTurnstileToken(t), []);

  const ageNum = Number(age);
  const challengeOk = !TURNSTILE_SITE_KEY || turnstileToken.length > 0;
  const valid =
    ageNum >= 13 &&
    ageNum <= 120 &&
    country.length === 2 &&
    text.trim().length >= 4 &&
    text.length <= MAX_LENGTH &&
    challengeOk;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    // Optimistic local update — the page feels instantly populated
    onSubmit({ age: ageNum, countryCode: country, text, category: finalCategory });
    // Best-effort persistence; route falls back to in-memory when no Supabase
    fetch("/api/concerns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: ageNum,
        countryCode: country,
        text,
        category: finalCategory,
        turnstileToken: turnstileToken || undefined,
      }),
    }).catch(() => {});
    setSubmitted({
      text: text.trim(),
      age: ageNum,
      countryCode: country,
      category: finalCategory,
      serial,
    });
  }

  function reset() {
    setAge("");
    setCountry("");
    setText("");
    setCategory("");
    setSubmitted(null);
  }

  return (
    <section
      id="submit"
      className="paper-grain relative isolate bg-paper-deep px-5 py-24 text-ink sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-end justify-between border-b border-ink/15 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/60">
              § 02 — submission altar
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight sm:text-5xl">
              add your voice to the record.
            </h2>
          </div>
          <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 sm:block">
            anonymous · permanent
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              {/* fill-in-the-blank ID line */}
              <p className="font-serif text-3xl italic leading-[1.45] text-ink sm:text-4xl">
                I am{" "}
                <input
                  className="dotted-input w-20 font-serif italic"
                  placeholder="age"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                  aria-label="age"
                  required
                />{" "}
                years old, in{" "}
                <select
                  className="dotted-input w-56 cursor-pointer appearance-none bg-transparent font-serif italic"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  aria-label="country"
                >
                  <option value="">your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                .
              </p>

              {/* the concern */}
              <div>
                <label
                  htmlFor="concern"
                  className="mb-3 block font-mono text-[11px] uppercase tracking-[0.25em] text-ink/70"
                >
                  my biggest concern —
                </label>
                <textarea
                  id="concern"
                  rows={4}
                  className="dotted-input font-serif text-2xl italic leading-snug placeholder:text-mist sm:text-3xl"
                  placeholder="say it plainly. nobody will know it was you."
                  maxLength={MAX_LENGTH}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
                  <span>
                    detected:{" "}
                    <span className="text-blood">{CATEGORY_LABELS[finalCategory]}</span>
                  </span>
                  <span>
                    {text.length}/{MAX_LENGTH}
                  </span>
                </div>
              </div>

              {/* category override */}
              <div>
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/70">
                  or choose a tag (optional)
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ORDER.map((c) => {
                    const active = (category || detected) === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(category === c ? "" : c)}
                        className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                          active
                            ? "border-ink bg-ink text-paper"
                            : "border-ink/25 text-ink/70 hover:border-ink hover:text-ink"
                        }`}
                      >
                        {CATEGORY_LABELS[c]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* turnstile widget — only renders when site key configured */}
              {TURNSTILE_SITE_KEY && (
                <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onToken={handleToken} />
              )}

              {/* submit */}
              <div className="flex flex-col-reverse items-stretch gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ink/55">
                  permanent · anonymous · public.
                </p>
                <button
                  type="submit"
                  disabled={!valid}
                  className="group relative inline-flex items-center justify-center gap-3 self-start bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.32em] text-paper transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blood sm:self-auto"
                >
                  <span>submit to the record</span>
                  <span aria-hidden className="text-blood transition group-hover:text-paper">
                    →
                  </span>
                </button>
              </div>
            </motion.form>
          ) : (
            <Receipt key="receipt" submitted={submitted} onReset={reset} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Receipt({
  submitted,
  onReset,
}: {
  submitted: Submitted;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative border border-ink/30 bg-bone p-8 sm:p-12"
    >
      {/* subtle stamp */}
      <div className="pointer-events-none absolute right-6 top-6 hidden rotate-[-8deg] sm:block">
        <div className="border-2 border-blood/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-blood/70">
          recorded
        </div>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
        entry № {submitted.serial.toLocaleString().padStart(6, "0")} · {submitted.countryCode} · age {submitted.age}
      </div>
      <p className="mt-6 font-serif text-3xl italic leading-snug sm:text-4xl">
        “{submitted.text}”
      </p>
      <div className="mt-10 flex flex-col-reverse gap-4 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
          your voice has been added to the record. it cannot be edited or removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink underline-offset-4 hover:underline"
          >
            ← submit another
          </button>
          <button
            onClick={() => {
              const url = "https://whatisyourconcern.com";
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator
                  .share({
                    title: "what is your concern?",
                    text: "I added my voice to the global record. add yours.",
                    url,
                  })
                  .catch(() => {});
              } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(url).catch(() => {});
              }
            }}
            className="bg-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-paper hover:bg-blood"
          >
            share this place →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
