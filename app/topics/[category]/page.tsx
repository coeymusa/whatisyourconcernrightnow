import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type Concern,
  type ConcernCategory,
} from "../../lib/types";
import { findCountry } from "../../lib/countries";
import { getConcernsByCategory } from "../../lib/page-data";
import { getTopicSignals } from "../../lib/public-signals";
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

export function generateStaticParams() {
  return CATEGORY_ORDER.filter((c) => c !== "other").map((category) => ({
    category,
  }));
}
export const dynamicParams = false;
export const revalidate = 1800;

type Props = { params: Promise<{ category: string }> };

const TOPIC_BLURB: Record<string, string> = {
  economy:
    "Cost of living, inflation, wages, jobs, currency, savings — what won't add up at the end of the month.",
  climate:
    "Fire, flood, heat, drought, biodiversity, water — the planet, on the record.",
  war: "War, violence, weapons, sirens, sons turning eighteen, neighbours on the other side.",
  democracy:
    "Elections, authoritarianism, censorship, theatre, the slow erosion that nobody televises.",
  health:
    "Hospitals, healthcare access, mental health, sleeping, dying, surviving.",
  ai: "Algorithms, deepfakes, replacements, the things that talk back when the people stop.",
  loneliness:
    "Isolation, meaning, friends, evenings, the rooms that don't fill anymore.",
  housing:
    "Rent, mortgages, landlords, the country you can't afford to be born in.",
  inequality:
    "Wealth, class, race, caste — the unfairness that won't move.",
  education:
    "Schools, teachers, students, what we are leaving the next generation to read.",
  future:
    "Tomorrow, kids, the species — and whether anyone is coming for it.",
};

function isCategory(s: string): s is ConcernCategory {
  return (CATEGORY_ORDER as string[]).includes(s);
}

function topicFileNo(cat: ConcernCategory): string {
  const list = CATEGORY_ORDER.filter((c) => c !== "other") as ConcernCategory[];
  const i = list.indexOf(cat);
  return String(i + 1).padStart(2, "0");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  const label = CATEGORY_LABELS[category];
  const url = `${SITE_URL}/topics/${category}`;
  return {
    title: `${label} · the record`,
    description: `What the world is saying about ${label.toLowerCase()} — public discourse and anonymous voices, gathered in one place. ${TOPIC_BLURB[category] ?? ""}`,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} · what is your concern?`,
      description:
        TOPIC_BLURB[category] ??
        `What the world is saying about ${label.toLowerCase()}.`,
      url,
      type: "website",
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

export default async function TopicPage({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category) || category === "other") notFound();

  const label = CATEGORY_LABELS[category];
  const url = `${SITE_URL}/topics/${category}`;
  const fileNo = topicFileNo(category);

  const [concerns, signals] = await Promise.all([
    getConcernsByCategory(category, 40) as Promise<Concern[]>,
    getTopicSignals(category, 14),
  ]);

  const countryCount = new Map<string, number>();
  for (const c of concerns) {
    countryCount.set(c.countryCode, (countryCount.get(c.countryCode) ?? 0) + 1);
  }
  const topCountries = [...countryCount.entries()]
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
        name: "Concerns by topic",
        item: `${SITE_URL}/topics`,
      },
      { "@type": "ListItem", position: 3, name: label, item: url },
    ],
  };

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} · the record`,
    description: TOPIC_BLURB[category],
    url,
    isPartOf: { "@id": `${SITE_URL}/#site` },
    inLanguage: "en",
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
        middle={`vol. I · topic ${fileNo} · ${category}`}
      />

      <article className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text={`file no. X.${fileNo} — topic dossier`} />

        <Breadcrumb
          tone="paper"
          crumbs={[
            { label: "home", href: "/" },
            { label: "topics", href: "/topics" },
            { label: category },
          ]}
        />

        <SectionMark tone="paper">
          § topic {fileNo} — {category}
        </SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.4rem,7.5vw,5.5rem)] italic leading-[0.95] tracking-[-0.01em]">
          {label}
          <span className="not-italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          {TOPIC_BLURB[category]}
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
              label: "topic code",
              value: `X.${fileNo}`,
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
              On the wire — {label.toLowerCase()}
            </h2>
          </div>
          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
            Top threads and stories on {label.toLowerCase()} from public
            sources right now — Reddit, Hacker News, the press. Each entry
            links back to its origin.
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
                Anonymous voices on {label.toLowerCase()}
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              Concerns submitted to <em>the record</em>, classified under
              this topic. Anonymous, unedited, in the order they arrived.
            </p>

            <ol className="mt-10 space-y-12">
              {concerns.map((c, i) => {
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
                      <blockquote className="mt-3 font-serif text-2xl leading-[1.18] text-ink decoration-blood/40 underline-offset-[6px] group-hover:underline sm:text-3xl">
                        &ldquo;{c.text}&rdquo;
                      </blockquote>
                    </Link>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/15 pt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
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
                      <span>{relativeDate(c.ts)}</span>
                      <span className="text-ink/30">·</span>
                      <Link
                        href={`/dispatch/${c.id}`}
                        aria-label={`Permalink to anon dispatch no. ${i + 1} on ${label.toLowerCase()}`}
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

        {concerns.length === 0 && (
          <section className="mt-24 border-t border-ink/15 pt-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
              § II — anonymous voices
            </div>
            <p className="mt-4 font-serif text-2xl italic leading-snug text-ink-mid sm:text-3xl">
              No anonymous voices on this topic yet.
              <br />
              The first one on permanent record could be yours.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
            >
              ↓ add your voice — it takes 30 seconds
            </Link>
          </section>
        )}

        <ShareDispatch
          url={url}
          text={`What the world is saying about ${label.toLowerCase()} — the record`}
        />

        {topCountries.length > 0 && (
          <section className="mt-24 border-t border-ink/15 pt-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
              § appendix — where this concern is loudest
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {topCountries.map(([code, count]) => {
                const country = findCountry(code);
                return (
                  <Link
                    key={code}
                    href={`/world/${code}`}
                    className="group block border-l-2 border-blood/30 pl-4 transition hover:border-blood"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/45">
                      {count} {count === 1 ? "voice" : "voices"} from
                    </div>
                    <div className="mt-1 font-serif text-xl italic text-ink group-hover:text-blood sm:text-2xl">
                      {country?.name ?? code}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <Colophon
          tone="paper"
          signature={`vol. I · topic ${fileNo} · ${category} — fin.`}
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          `${label.toLowerCase()} · the record`,
          "press · reddit · hn · anon",
          "the world is listening",
          "no names · no accounts",
        ]}
      />
    </PageBg>
  );
}
