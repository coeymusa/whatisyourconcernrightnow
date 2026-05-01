"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import QuickAdd from "./QuickAdd";
import ShareLinks from "./ShareLinks";
import type { ConcernCategory } from "../lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    age: number;
    countryCode: string;
    text: string;
    category: ConcernCategory;
  }) => void;
  initialCountry?: string;
};

export default function PostDialog({
  open,
  onClose,
  onSubmit,
  initialCountry,
}: Props) {
  const [submitted, setSubmitted] = useState(false);

  // reset every time the dialog opens
  useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/75 backdrop-blur-sm"
          />
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={submitted ? "share what you started" : "post your concern"}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.3, 1] }}
            className="
              fixed left-1/2 top-1/2 z-[70] w-[min(92vw,40rem)]
              -translate-x-1/2 -translate-y-1/2 border border-bone/20
              bg-ink-soft/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]
              backdrop-blur
            "
          >
            <div className="flex items-center justify-between border-b border-bone/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/65">
              <span>
                {submitted ? "your voice is on the record" : "post anonymously"}
              </span>
              <button
                onClick={onClose}
                className="text-bone/55 transition hover:text-blood"
              >
                close ✕
              </button>
            </div>

            {!submitted ? (
              <QuickAdd
                initialCountry={initialCountry}
                onSubmit={(input) => {
                  onSubmit(input);
                  // peak willingness-to-share is the 30s after someone just
                  // contributed — pivot the dialog to a share prompt instead
                  // of auto-closing
                  window.setTimeout(() => setSubmitted(true), 700);
                }}
              />
            ) : (
              <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-8">
                <div>
                  <p className="font-serif text-2xl italic leading-snug text-bone sm:text-3xl">
                    your voice has been added.
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/55">
                    share this place — that's the only way the record grows.
                  </p>
                </div>

                <ShareLinks tone="dark" />

                <button
                  onClick={onClose}
                  className="w-full border-t border-bone/10 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55 transition hover:text-bone"
                >
                  ← keep listening
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
