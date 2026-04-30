"use client";

// Drop-in donate link. Set `NEXT_PUBLIC_DONATE_URL` in .env / Vercel env to
// the Stripe Payment Link, BuyMeACoffee URL, or any other donation URL.
// Renders nothing when unset.
const URL_FROM_ENV = process.env.NEXT_PUBLIC_DONATE_URL;

type Props = { variant?: "compact" | "block" };

export default function DonateLink({ variant = "compact" }: Props) {
  if (!URL_FROM_ENV) return null;

  if (variant === "compact") {
    return (
      <a
        href={URL_FROM_ENV}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/60 transition hover:text-amber"
        aria-label="support this site"
      >
        <span className="text-amber">◆</span>
        <span>support</span>
      </a>
    );
  }

  return (
    <a
      href={URL_FROM_ENV}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 border border-amber/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-amber transition hover:bg-amber hover:text-ink"
    >
      <span>◆</span>
      <span>support the record</span>
      <span aria-hidden>→</span>
    </a>
  );
}
