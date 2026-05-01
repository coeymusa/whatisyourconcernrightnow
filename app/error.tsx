"use client";

import { useEffect } from "react";

// Route-segment error boundary. Renders when a child component throws.
// Keeps users on a styled fallback rather than the default Next.js error page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // best-effort log so we can see crashes in Vercel logs
    if (typeof console !== "undefined") {
      console.error("[ui-error]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-bone">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">
          unexpected interruption
        </div>
        <h1 className="mt-5 font-serif text-4xl italic leading-tight sm:text-5xl">
          something stuttered.
        </h1>
        <p className="mt-5 font-serif text-lg italic leading-snug text-bone/80">
          the record is still here. reload to keep listening.
        </p>
        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="bg-blood px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition hover:bg-bone hover:text-blood"
          >
            try again
          </button>
          <a
            href="/"
            className="border border-bone/30 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80 transition hover:border-bone hover:text-bone"
          >
            home
          </a>
        </div>
        {error.digest && (
          <p className="mt-8 font-mono text-[9px] tracking-[0.22em] text-bone/35">
            ref · {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
