import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchCategoryCounts,
  fetchCountryCounts,
  fetchRecent,
  hasSupabase,
} from "../lib/supabase";
import { findCountry } from "../lib/countries";
import {
  CATEGORY_LABELS,
  type Concern,
  type ConcernCategory,
} from "../lib/types";
import { fetchGdelt, type PublicSignal } from "../lib/sources";
import {
  Breadcrumb,
  Colophon,
  CornerMark,
  Marquee,
  PageBg,
  SectionMark,
  StatRow,
  TopBar,
} from "../components/editorial";
import PublicDiscourseList from "../components/PublicDiscourseList";

const SITE_URL = "https://whatisyourconcern.com";

export const metadata: Metadata = {
  title: "The pulse",
  description:
    "What is the world afraid of, right now? A live editorial pulse of the anonymous global concern record — top voices, loudest countries, and the wire on every topic.",
  alternates: { canonical: `${SITE_URL}/pulse` },
  openGraph: {
    title: "The pulse · what is your concern?",
    description:
      "What is the world afraid of, right now? A live editorial pulse — top voices, loudest countries, and the wire.",
    url: `${SITE_URL}/pulse`,
    type: "article",
  },
};

export const revalidate = 600;

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "The pulse", item: `${SITE_URL}/pulse` },
  ],
};

function relativeDate(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (30 * 86400))}mo ago`;
}

function thisWeekIso(): string {
  const d = new Date();
  // ISO week: Thu of the week, year+W##
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}·W${String(weekNum).padStart(2, "0")}`;
}

export default async function PulsePage() {
  const supabaseOn = hasSupabase();

  const [recentRows, countryCounts, categoryCounts, globalSignals] =
    await Promise.all([
      supabaseOn ? fetchRecent(20, 0, 0) : Promise.resolve([]),
      supabaseOn ? fetchCountryCounts() : Promise.resolve(new Map<string, number>()),
      supabaseOn ? fetchCategoryCounts() : Promise.resolve(new Map<string, number>()),
      // Global wire — no country filter, just the most-recent English news.
      fetchGdelt("(world OR humanity OR society OR climate OR democracy OR economy)", 8),
    ]);

  const recent: Concern[] = recentRows.map((r) => ({
    id: r.id,
    age: r.age,
    bracket: r.bracket as Concern["bracket"],
    countryCode: r.country_code,
    text: r.text,
    category: r.category as ConcernCategory,
    ts: new Date(r.created_at).getTime(),
  }));

  const totalVoices = [...countryCounts.values()].reduce((a, b) => a + b, 0);
  const liveCountries = countryCounts.size;
  const topCountries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topTopics = [...categoryCounts.entries()]
    .filter(([k]) => k !== "other")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const last24h = recent.filter(
    (c) => Date.now() - c.ts < 24 * 60 * 60 * 1000,
  );

  const wireSignals: PublicSignal[] = globalSignals.slice(0, 6);

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar
        tone="paper"
        middle={`vol. I · ${thisWeekIso()} · the pulse`}
      />

      <article className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text={`issue ${thisWeekIso()} — the pulse`} />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "pulse" }]}
        />

        <SectionMark tone="paper">
          § issue {thisWeekIso()} — what the world is afraid of, right now
        </SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5.8rem)] italic leading-[0.95] tracking-[-0.01em]">
          The
          <br />
          <span className="not-italic">pulse</span>
          <span className="italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          A live editorial summary of <em>the record</em> — the loudest
          voices, the loudest countries, the loudest topics, and the public
          discourse on the wire right now.
        </p>

        <StatRow
          tone="paper"
          items={[
            {
              label: "voices recorded",
              value: totalVoices.toLocaleString(),
              accent: "blood",
            },
            {
              label: "countries live",
              value: liveCountries.toLocaleString(),
              accent: "amber",
            },
            {
              label: "in last 24h",
              value: last24h.length.toLocaleString(),
            },
            {
              label: "issue",
              value: thisWeekIso(),
            },
          ]}
        />

        {/* §  Most recent voices */}
        {recent.length > 0 && (
          <section className="mt-20">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § I
              </span>
              <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                Just in — anonymous voices on the record
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              The {Math.min(recent.length, 8)} most recent concerns submitted
              by people anywhere in the world, in the order they arrived.
            </p>

            <ol className="mt-10 space-y-10">
              {recent.slice(0, 8).map((c, i) => {
                const country = findCountry(c.countryCode);
                return (
                  <li key={c.id} className="relative">
                    <Link
                      href={`/dispatch/${c.id}`}
                      className="block group"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/40 transition group-hover:text-ink">
                        no. {String(i + 1).padStart(3, "0")} — anon dispatch
                      </div>
                      <blockquote className="mt-3 font-serif text-2xl leading-[1.18] text-ink decoration-blood/40 underline-offset-[6px] group-hover:underline sm:text-[28px]">
                        &ldquo;{c.text}&rdquo;
                      </blockquote>
                    </Link>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/15 pt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                      {country ? (
                        <Link
                          href={`/world/${country.code}`}
                          className="hover:text-ink"
                        >
                          {country.name}
                        </Link>
                      ) : (
                        <span>{c.countryCode}</span>
                      )}
                      <span className="text-ink/30">·</span>
                      <span>ages {c.bracket}</span>
                      <span className="text-ink/30">·</span>
                      <Link
                        href={`/topics/${c.category}`}
                        className="hover:text-ink"
                      >
                        {CATEGORY_LABELS[c.category].toLowerCase()}
                      </Link>
                      <span className="text-ink/30">·</span>
                      <span>{relativeDate(c.ts)}</span>
                      <span className="text-ink/30">·</span>
                      <Link
                        href={`/dispatch/${c.id}`}
                        className="text-ink/55 hover:text-ink"
                      >
                        permalink →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* §  Where the record is loudest */}
        {topCountries.length > 0 && (
          <section className="mt-24">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § II
              </span>
              <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                Where the record is loudest
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              The five countries that have submitted the most voices to{" "}
              <em>the record</em> so far.
            </p>
            <ol className="mt-8 space-y-3">
              {topCountries.map(([code, n], i) => {
                const country = findCountry(code);
                return (
                  <li
                    key={code}
                    className="flex items-baseline justify-between border-b border-ink/10 pb-3"
                  >
                    <Link
                      href={`/world/${code}`}
                      className="group flex items-baseline gap-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                        {code}
                      </span>
                      <span className="font-serif text-2xl italic text-ink group-hover:text-blood sm:text-3xl">
                        {country?.name ?? code}
                      </span>
                    </Link>
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-blood">
                      {n} {n === 1 ? "voice" : "voices"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* §  Loudest topics */}
        {topTopics.length > 0 && (
          <section className="mt-24">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § III
              </span>
              <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                What the world fears most
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              The five topics that contributors have written about most often.
            </p>
            <ol className="mt-8 space-y-3">
              {topTopics.map(([cat, n], i) => (
                <li
                  key={cat}
                  className="flex items-baseline justify-between border-b border-ink/10 pb-3"
                >
                  <Link
                    href={`/topics/${cat}`}
                    className="group flex items-baseline gap-4"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-2xl italic text-ink group-hover:text-blood sm:text-3xl">
                      {CATEGORY_LABELS[cat as ConcernCategory]}
                    </span>
                  </Link>
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-blood">
                    {n} {n === 1 ? "voice" : "voices"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* §  Global wire */}
        {wireSignals.length > 0 && (
          <section className="mt-24">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § IV
              </span>
              <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                On the wire — the world is saying
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              Top news on the wire right now, alongside what people are
              telling <em>the record</em>.
            </p>
            <div className="mt-8">
              <PublicDiscourseList signals={wireSignals} />
            </div>
          </section>
        )}

        <Colophon
          tone="paper"
          signature={`vol. I · issue ${thisWeekIso()} · the pulse — fin.`}
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "the pulse",
          "what is the world afraid of",
          "live · the record",
          "no names · no accounts",
          "the world is listening",
        ]}
      />
    </PageBg>
  );
}
