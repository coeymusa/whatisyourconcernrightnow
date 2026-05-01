"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COUNTRIES, findCountry } from "../lib/countries";
import { CATEGORY_LABELS, type Concern, type Solution } from "../lib/types";
import { moderateClient } from "../lib/moderation";
import { useFocusTrap } from "../lib/use-focus-trap";

const MAX_LENGTH = 280;

type Props = {
  concern: Concern | null;
  solutions: Solution[];
  onClose: () => void;
  onSubmitSolution: (input: {
    concernId: string;
    age: number;
    countryCode: string;
    text: string;
  }) => void;
};

export default function EntryDrawer({
  concern,
  solutions,
  onClose,
  onSubmitSolution,
}: Props) {
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [text, setText] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // reset form whenever drawer opens for a different concern
  useEffect(() => {
    if (concern) {
      setAge("");
      setCountry("");
      setText("");
      setSubmittedId(null);
    }
  }, [concern?.id]);

  // body scroll lock; focus trap (with Escape close) is managed below.
  useEffect(() => {
    if (!concern) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [concern]);

  // Focus trap + Escape + restore-on-close. Hook reads the ref's
  // currentValue at mount time; container always exists when concern is
  // truthy (motion.aside is rendered inside the AnimatePresence branch).
  const dialogRef = useRef<HTMLElement | null>(null);
  useFocusTrap(dialogRef, !!concern, onClose);

  const matched = useMemo(
    () =>
      concern
        ? solutions.filter((s) => s.concernId === concern.id).sort((a, b) => b.ts - a.ts)
        : [],
    [solutions, concern],
  );

  const ageNum = Number(age);
  const valid =
    ageNum >= 13 &&
    ageNum <= 120 &&
    country.length === 2 &&
    text.trim().length >= 4 &&
    text.length <= MAX_LENGTH;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !concern || submitting) return;
    const mod = moderateClient(text);
    if (!mod.ok) {
      setError(mod.reason);
      return;
    }
    setError(null);
    setSubmitting(true);
    onSubmitSolution({
      concernId: concern.id,
      age: ageNum,
      countryCode: country,
      text,
    });
    setSubmittedId(`${Date.now()}`);
    setText("");
    window.setTimeout(() => setSubmitting(false), 1500);
  }

  return (
    <AnimatePresence>
      {concern && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            ref={dialogRef as React.RefObject<HTMLElement>}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.42, ease: [0.2, 0.7, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-y-auto bg-paper text-ink sm:max-w-2xl outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="entry detail"
          >
            {/* top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/15 bg-paper/95 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60 backdrop-blur">
              <span>
                entry № {concern.id.slice(-6).toUpperCase()} ·{" "}
                <span className="text-blood">
                  {findCountry(concern.countryCode)?.name ?? concern.countryCode}
                </span>{" "}
                · age {concern.age}
              </span>
              <button
                onClick={onClose}
                className="text-ink/60 transition hover:text-blood"
                aria-label="close"
              >
                close <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* the concern */}
            <div className="border-b border-ink/15 bg-paper px-6 py-10 sm:px-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">
                the concern
              </div>
              <p className="mt-4 font-serif text-3xl italic leading-snug text-ink sm:text-4xl">
                “{concern.text}”
              </p>
              {concern.original && (
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink/50">
                  <span className="uppercase tracking-[0.2em] text-ink/35">
                    originally in {concern.original.lang}:{" "}
                  </span>
                  <span className="italic">“{concern.original.text}”</span>
                </p>
              )}
              <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                {CATEGORY_LABELS[concern.category]}
              </div>
            </div>

            {/* responses */}
            <div className="border-b border-ink/15 bg-paper-deep px-6 py-10 sm:px-10">
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">
                  responses · {matched.length}
                </div>
                {matched.length === 0 && (
                  <span className="font-mono text-[10px] italic text-ink/45">
                    be the first.
                  </span>
                )}
              </div>

              <ul className="mt-5 space-y-5">
                {matched.map((s) => (
                  <li
                    key={s.id}
                    className="border-l-2 border-amber pl-4"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      {findCountry(s.countryCode)?.name ?? s.countryCode} · age {s.age}
                    </div>
                    <p className="mt-1.5 font-serif text-xl italic leading-snug text-ink/90 sm:text-2xl">
                      “{s.text}”
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* form */}
            <div className="px-6 py-10 sm:px-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">
                offer a solution
              </div>
              <h3 className="mt-3 font-serif text-3xl italic leading-tight text-ink">
                what would you say to them?
              </h3>

              {submittedId ? (
                <div className="mt-6 border border-amber/40 bg-bone p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber">
                    response recorded
                  </div>
                  <p className="mt-2 font-serif text-lg italic text-ink/85">
                    your voice now sits beside theirs.
                  </p>
                  <button
                    onClick={() => setSubmittedId(null)}
                    className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink underline-offset-4 hover:underline"
                  >
                    ← write another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <p className="font-serif text-xl italic leading-snug text-ink/90">
                    I am{" "}
                    <input
                      className="dotted-input w-16 font-serif italic"
                      placeholder="age"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={age}
                      onChange={(e) =>
                        setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
                      }
                      required
                      aria-label="age"
                    />{" "}
                    in{" "}
                    <select
                      className="dotted-input w-44 cursor-pointer appearance-none bg-transparent font-serif italic"
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
                  <textarea
                    rows={4}
                    className="dotted-input font-serif text-xl italic leading-snug placeholder:text-mist sm:text-2xl"
                    placeholder="be honest. be useful. be brief."
                    maxLength={MAX_LENGTH}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                    <span>solidarity · perspective · practice</span>
                    <span>
                      {text.length}/{MAX_LENGTH}
                    </span>
                  </div>
                  {error && (
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blood">
                      ⚠ {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!valid || submitting}
                    className="group inline-flex items-center gap-3 bg-amber px-7 py-3.5 font-mono text-xs uppercase tracking-[0.3em] text-ink transition hover:bg-ink hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>{submitting ? "sending…" : "offer this response"}</span>
                    <span aria-hidden>→</span>
                  </button>
                </form>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
