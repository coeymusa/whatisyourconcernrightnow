import Link from "next/link";

// Shared editorial chrome for all subpages of the record.
// The look is borrowed from the homepage Hero/Manifesto: hairline rules,
// mono-caps section markers, a top instrument bar, and a bottom marquee.

type Tone = "paper" | "ink";

const PALETTE: Record<
  Tone,
  {
    bg: string;
    grain: string;
    text: string;
    border: string;
    mute: string;
    dim: string;
    softer: string;
    accentRow: string;
    rule: string;
  }
> = {
  paper: {
    bg: "bg-paper",
    grain: "paper-grain",
    text: "text-ink",
    border: "border-ink/15",
    mute: "text-ink/70",
    dim: "text-ink/45",
    softer: "text-ink/55",
    accentRow: "bg-paper-deep",
    rule: "text-ink/55",
  },
  ink: {
    bg: "bg-ink",
    grain: "paper-grain-dark",
    text: "text-bone",
    border: "border-bone/15",
    mute: "text-bone/65",
    dim: "text-bone/40",
    softer: "text-bone/55",
    accentRow: "bg-ink-soft",
    rule: "text-bone/55",
  },
};

export type Crumb = { label: string; href?: string };

export function TopBar({
  tone,
  middle,
  right,
}: {
  tone: Tone;
  middle?: string;
  right?: string;
}) {
  const p = PALETTE[tone];
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className={`border-b ${p.border} px-5 py-3 sm:px-10`}>
      <div
        className={`flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] ${p.mute} sm:text-[11px]`}
      >
        <div className="flex items-center gap-3">
          <span className="live-dot" aria-hidden />
          <span>Live · the record</span>
        </div>
        {middle && <div className="hidden sm:block">{middle}</div>}
        <div>{right ?? today}</div>
      </div>
    </div>
  );
}

export function CornerMark({
  tone,
  text,
}: {
  tone: Tone;
  text: string;
}) {
  const p = PALETTE[tone];
  return (
    <div
      className={`pointer-events-none absolute right-5 top-20 hidden font-mono text-[10px] uppercase tracking-[0.22em] ${p.dim} sm:block sm:right-10 lg:right-16`}
    >
      ◣&nbsp;{text}
    </div>
  );
}

export function Breadcrumb({
  tone,
  crumbs,
}: {
  tone: Tone;
  crumbs: Crumb[];
}) {
  const p = PALETTE[tone];
  const linkClass =
    tone === "paper" ? "hover:text-ink" : "hover:text-bone";
  return (
    <nav
      aria-label="breadcrumb"
      className={`font-mono text-[10px] uppercase tracking-[0.3em] ${p.softer}`}
    >
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && <span className={`mx-2 ${p.dim}`}>/</span>}
          {c.href ? (
            <Link href={c.href} className={linkClass}>
              {c.label}
            </Link>
          ) : (
            <span>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionMark({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  const p = PALETTE[tone];
  return (
    <div
      className={`mt-8 font-mono text-[10px] uppercase tracking-[0.32em] ${p.softer}`}
    >
      {children}
    </div>
  );
}

export function Marquee({
  tone,
  phrases,
}: {
  tone: Tone;
  phrases: string[];
}) {
  const p = PALETTE[tone];
  const list = phrases.length > 0 ? phrases : DEFAULT_PHRASES;
  return (
    <div className={`overflow-hidden border-y ${p.border} ${p.accentRow}`}>
      <div
        className={`marquee flex whitespace-nowrap py-3 font-mono text-[11px] uppercase tracking-[0.32em] ${p.softer}`}
      >
        {[0, 1].map((i) => (
          <div key={i} className="flex shrink-0 items-center gap-8 px-6">
            {list.map((m, j) => (
              <span
                key={`${i}-${j}`}
                className="inline-flex items-center gap-8"
              >
                <span className="text-blood">◆</span>
                <span>{m}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Colophon({
  tone,
  signature,
}: {
  tone: Tone;
  signature: string;
}) {
  const p = PALETTE[tone];
  return (
    <div
      className={`mt-20 flex flex-wrap items-center justify-between gap-3 border-t ${p.border} pt-8 font-mono text-[10px] uppercase tracking-[0.3em] ${p.dim}`}
    >
      <span>{signature}</span>
      <span className="hidden sm:inline">
        © the record · {new Date().getFullYear()}
      </span>
    </div>
  );
}

export function StatRow({
  tone,
  items,
}: {
  tone: Tone;
  items: { label: string; value: string; accent?: "blood" | "amber" }[];
}) {
  const p = PALETTE[tone];
  return (
    <div
      className={`mt-12 grid grid-cols-2 gap-6 border-y ${p.border} py-6 font-mono text-xs uppercase tracking-[0.16em] ${p.mute} sm:grid-cols-4 sm:gap-12`}
    >
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-1.5">
          <span className={`text-[10px] tracking-[0.24em] ${p.dim}`}>
            {it.label}
          </span>
          <span
            className={`font-serif italic text-2xl sm:text-3xl ${
              it.accent === "blood"
                ? "text-blood"
                : it.accent === "amber"
                  ? "text-amber"
                  : tone === "paper"
                    ? "text-ink"
                    : "text-bone"
            }`}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PageBg({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  const p = PALETTE[tone];
  return (
    <main className={`relative isolate overflow-hidden ${p.grain} ${p.bg} ${p.text}`}>
      {children}
    </main>
  );
}

const DEFAULT_PHRASES = [
  "an anonymous record",
  "one person · one voice · one entry",
  "no names · no accounts",
  "the world is listening",
  "what is your concern",
  "you are not alone",
];
