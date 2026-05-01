import type { PublicSignal } from "../lib/sources";

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d`;
  if (diff < 365 * 86400) return `${Math.floor(diff / (30 * 86400))}mo`;
  return `${Math.floor(diff / (365 * 86400))}y`;
}

const SOURCE_PILL: Record<PublicSignal["source"], string> = {
  gdelt: "press",
  reddit: "reddit",
  hn: "hn",
};

export default function PublicDiscourseList({
  signals,
}: {
  signals: PublicSignal[];
}) {
  if (signals.length === 0) {
    return (
      <p className="font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
        The wires are quiet right now. Try again in a few minutes.
      </p>
    );
  }
  return (
    <ol className="space-y-10">
      {signals.map((s, i) => (
        <li key={s.url} className="relative">
          <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
            <span className="text-ink/40">
              no. {String(i + 1).padStart(3, "0")}
            </span>
            <span
              className={`rounded-sm px-1.5 py-0.5 text-[9px] tracking-[0.28em] ${
                s.source === "gdelt"
                  ? "bg-blood/15 text-blood"
                  : s.source === "reddit"
                    ? "bg-amber/20 text-amber"
                    : "bg-ink/10 text-ink"
              }`}
            >
              {SOURCE_PILL[s.source]}
            </span>
            <span className="text-ink/40">{s.sourceLabel}</span>
            <span className="text-ink/30">·</span>
            <span className="text-ink/40">{relativeTime(s.ts)} ago</span>
          </div>

          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block group"
          >
            <h3 className="font-serif text-2xl leading-[1.18] text-ink decoration-blood/40 underline-offset-[6px] group-hover:underline sm:text-[28px]">
              {s.title}
            </h3>
            {s.excerpt && (
              <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
                {s.excerpt}
              </p>
            )}
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-ink/45 transition group-hover:text-ink">
              read at {s.sourceLabel} →
            </div>
          </a>
        </li>
      ))}
    </ol>
  );
}
