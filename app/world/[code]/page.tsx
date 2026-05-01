import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, findCountry } from "../../lib/countries";
import { getConcernsByCountry } from "../../lib/page-data";
import { getCountrySignals } from "../../lib/public-signals";
import { CATEGORY_LABELS, type ConcernCategory } from "../../lib/types";
import {
  Breadcrumb,
  Colophon,
  CornerMark,
  Marquee,
  PageBg,
  SectionMark,
  StatRow,
  TopBar,
} from "../../components/editorial";
import PublicDiscourseList from "../../components/PublicDiscourseList";
import ShareDispatch from "../../components/ShareDispatch";

const SITE_URL = "https://whatisyourconcern.com";

// Pre-render the top traffic countries at build time. Everything else is
// generated on first request and cached via ISR — keeps the build fast and
// avoids burst-rate-limiting external sources (GDELT etc.) during the build.
export function generateStaticParams() {
  return [
    "US", "GB", "CA", "AU", "IN", "BR", "JP", "DE", "FR", "MX",
    "RU", "CN", "ZA", "NG", "ID", "PH", "TR", "IR", "EG", "KR",
    "IT", "ES", "NL", "PL", "UA", "PK", "BD", "VN", "TH", "AR",
  ].map((code) => ({ code }));
}
export const dynamicParams = true;
export const revalidate = 1800;

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) return {};
  const url = `${SITE_URL}/world/${country.code}`;
  return {
    title: `${country.name} · the record`,
    description: `What is ${country.name} concerned about right now? A live record of public discourse and anonymous voices from ${country.name} — news, threads, and concerns, in one place.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${country.name} · what is your concern?`,
      description: `What is ${country.name} concerned about right now? Public discourse + anonymous voices from ${country.name}.`,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${country.name} · the record`,
      description: `What is ${country.name} concerned about right now?`,
    },
  };
}

function relativeDate(ts: number): string {
  const diffDays = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function fileNoFor(code: string): string {
  const i = COUNTRIES.findIndex((c) => c.code === code);
  return String(i + 1).padStart(3, "0");
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) notFound();

  // Fetch in parallel — the page is no faster than the slowest source.
  const [concerns, signals] = await Promise.all([
    getConcernsByCountry(country.code, 40),
    getCountrySignals(country.code, 12),
  ]);
  const url = `${SITE_URL}/world/${country.code}`;
  const fileNo = fileNoFor(country.code);

  const topicCount = new Map<ConcernCategory, number>();
  for (const c of concerns) {
    topicCount.set(c.category, (topicCount.get(c.category) ?? 0) + 1);
  }
  const topTopics = [...topicCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const latest = concerns[0];

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Concerns by country",
        item: `${SITE_URL}/world`,
      },
      { "@type": "ListItem", position: 3, name: country.name, item: url },
    ],
  };

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${country.name} · the record`,
    description: `Public discourse and anonymous concerns from ${country.name}.`,
    url,
    isPartOf: { "@id": `${SITE_URL}/#site` },
    inLanguage: "en",
    about: {
      "@type": "Country",
      name: country.name,
      identifier: country.code,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: signals.length + concerns.length,
      itemListElement: [
        ...signals.slice(0, 10).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "NewsArticle",
            headline: s.title,
            url: s.url,
            datePublished: new Date(s.ts).toISOString(),
            publisher: { "@type": "Organization", name: s.sourceLabel },
            inLanguage: "en",
          },
        })),
        ...concerns.slice(0, 10).map((c, i) => ({
          "@type": "ListItem",
          position: signals.slice(0, 10).length + i + 1,
          item: {
            "@type": "CreativeWork",
            name: c.text.slice(0, 80),
            text: c.text,
            inLanguage: "en",
            dateCreated: new Date(c.ts).toISOString(),
            locationCreated: { "@type": "Country", name: country.name },
            author: { "@type": "Person", name: "Anonymous" },
          },
        })),
      ],
    },
  };

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPage) }}
      />

      <TopBar
        tone="paper"
        middle={`vol. I · dossier ${fileNo} · ${country.code}`}
      />

      <article className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text={`file no. ${fileNo} — country dossier`} />

        <Breadcrumb
          tone="paper"
          crumbs={[
            { label: "home", href: "/" },
            { label: "world", href: "/world" },
            { label: country.name.toLowerCase() },
          ]}
        />

        <SectionMark tone="paper">
          § dossier {fileNo} — {country.name.toLowerCase()}
        </SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,7vw,5.5rem)] italic leading-[0.95] tracking-[-0.01em]">
          What is
          <br />
          <span className="not-italic">{country.name}</span>
          <br />
          <span className="text-blood">concerned about</span>
          <span className="italic">?</span>
        </h1>

        <p className="mt-10 max-w-2xl font-serif text-xl leading-snug text-ink-mid sm:text-2xl">
          A live record of what {country.name} is talking about right now —
          news on the wire, public threads, and anonymous voices from inside
          the country, gathered in one place. Updated continuously.
        </p>

        <StatRow
          tone="paper"
          items={[
            {
              label: "public signals",
              value: signals.length.toLocaleString(),
              accent: "blood",
            },
            {
              label: "anonymous voices",
              value: concerns.length.toLocaleString(),
              accent: "amber",
            },
            {
              label: "country code",
              value: country.code,
            },
            {
              label: "last entry",
              value: latest
                ? relativeDate(latest.ts)
                : signals[0]
                  ? relativeDate(signals[0].ts)
                  : "—",
            },
          ]}
        />

        {/* §  Public discourse — real, sourced */}
        <section className="mt-20">
          <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
              § I
            </span>
            <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
              On the wire — what {country.name} is saying publicly
            </h2>
          </div>
          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
            Top news headlines, threads, and discussions tied to{" "}
            {country.name} from public sources. Each entry is linked to its
            origin so you can read it in full.
          </p>
          <div className="mt-10">
            <PublicDiscourseList signals={signals} />
          </div>
        </section>

        {/* §  Anonymous voices — only when present */}
        {concerns.length > 0 && (
          <section className="mt-24">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § II
              </span>
              <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                Anonymous voices from {country.name}
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              Concerns submitted to <em>the record</em> by people in{" "}
              {country.name}. Anonymous, unedited, in the order they arrived.
            </p>

            <ol className="mt-10 space-y-12">
              {concerns.map((c, i) => (
                <li key={c.id} className="relative">
                  <Link
                    href={`/dispatch/${c.id}`}
                    className="block group"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/40 transition group-hover:text-ink">
                      no. {String(i + 1).padStart(3, "0")} — anon dispatch
                    </div>
                    <blockquote className="mt-3 font-serif text-2xl leading-[1.18] text-ink decoration-blood/40 underline-offset-[6px] group-hover:underline sm:text-3xl">
                      &ldquo;{c.text}&rdquo;
                    </blockquote>
                  </Link>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/15 pt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                    <span>{country.name}</span>
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
                      aria-label={`Permalink to anon dispatch no. ${i + 1} from ${country.name}`}
                      className="text-ink/55 hover:text-ink"
                    >
                      permalink →
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {concerns.length === 0 && (
          <section className="mt-24 border-t border-ink/15 pt-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
              § II — anonymous voices
            </div>
            <p className="mt-4 font-serif text-2xl italic leading-snug text-ink-mid sm:text-3xl">
              No anonymous voices have been submitted from {country.name} yet.
              <br />
              The first voice on permanent record could be yours.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
            >
              ↓ add your voice — it takes 30 seconds
            </Link>
          </section>
        )}

        {/* Appendix */}
        <section className="mt-24 border-t border-ink/15 pt-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
            § appendix — about this dossier
          </div>
          <h2 className="mt-4 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
            About the {country.name} dossier
          </h2>
          <div className="mt-6 grid gap-8 font-sans text-base leading-relaxed text-ink-soft sm:grid-cols-2 sm:text-lg">
            <p>
              The wire pulls from GDELT (a global index of news in 100+
              languages), the country's most active English-speaking
              subreddit when one exists, and Hacker News when relevant.
              Sources are clearly labelled and link back to the original.
              We do not edit headlines.
            </p>
            <p>
              The anonymous voices section comes from contributors who
              submitted a concern to <em>the record</em> from{" "}
              {country.name}. Their entries are unedited and unattributed —
              just an age bracket and a country.
            </p>
          </div>

          <ShareDispatch
            url={url}
            text={`What is ${country.name} concerned about? — the record`}
          />

          {topTopics.length > 0 && (
            <div className="mt-10 grid gap-4 border-t border-ink/15 pt-8 sm:grid-cols-3">
              {topTopics.map(([cat, count]) => (
                <Link
                  key={cat}
                  href={`/topics/${cat}`}
                  className="group block border-l-2 border-blood/30 pl-4 transition hover:border-blood"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/45">
                    {count} {count === 1 ? "voice" : "voices"} on
                  </div>
                  <div className="mt-1 font-serif text-xl italic text-ink group-hover:text-blood sm:text-2xl">
                    {CATEGORY_LABELS[cat]}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Colophon
          tone="paper"
          signature={`vol. I · dossier ${fileNo} · ${country.name.toLowerCase()} — fin.`}
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          `${country.name} · the record`,
          "press · reddit · anon dispatch",
          "the world is listening",
          "no names · no accounts",
        ]}
      />
    </PageBg>
  );
}
