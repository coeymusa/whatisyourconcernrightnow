"use client";

import { useState } from "react";

// Quiet email opt-in for "the dispatch" — the editorial digest of trends
// across the record. Deliberately decoupled from posting in copy and in
// the database, so subscribers can't be linked to anything they shared.
export default function Dispatch() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    try {
      const r = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!r.ok) {
        setState("error");
        return;
      }
      setState("ok");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="mt-12 border-t border-bone/15 pt-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
          § 03 — the dispatch
        </div>
        <p className="mt-4 font-serif text-2xl italic leading-snug text-bone sm:text-3xl">
          you're on the list.
        </p>
        <p className="mt-3 max-w-md font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55">
          one email a month, sometimes none. unsubscribe is one click.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-bone/15 pt-10">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
        § 03 — the dispatch
      </div>
      <p className="mt-4 max-w-xl font-serif text-2xl italic leading-snug text-bone sm:text-3xl">
        an occasional broadcast — what the record is saying, where, and how it's
        shifting.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          aria-label="email for the dispatch"
          className="
            flex-1 border border-bone/25 bg-ink/40 px-4 py-3
            font-serif text-base italic text-bone placeholder:text-bone/40
            focus:border-blood focus:outline-none
          "
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="
            border border-bone/40 bg-bone px-6 py-3 font-mono text-[10px]
            uppercase tracking-[0.25em] text-ink transition
            hover:border-blood hover:bg-blood hover:text-bone
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {state === "sending" ? "sending…" : "subscribe"}
        </button>
      </form>

      <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">
        not linked to anything you post. one email a month, sometimes none.
        unsubscribe is one click.
      </p>

      {state === "error" && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blood">
          something went wrong. try again in a moment.
        </p>
      )}
    </div>
  );
}
