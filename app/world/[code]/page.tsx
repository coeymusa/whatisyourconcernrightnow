import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, findCountry } from "../../lib/countries";
import { getConcernsByCountry } from "../../lib/page-data";
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

const SITE_URL = "https://whatisyourconcern.com";

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ code: c.code }));
}
export const dynamicParams = false;
export const revalidate = 600;

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) return {};
  const url = `${SITE_URL}/world/${country.code}`;
  return {
    title: `Concerns from ${country.name}`,
    description: `Anonymous concerns submitted by people in ${country.name}. What are people in ${country.name} afraid of, right now? An anonymous global record.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Concerns from ${country.name} · what is your concern?`,
      description: `What are people in ${country.name} afraid of, right now?`,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Concerns from ${country.name}`,
      description: `What are people in ${country.name} afraid of, right now?`,
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

// File-number for the country, padded to 3 digits, derived from the
// country index in COUNTRIES. Used as a faux dossier number in the header.
function fileNoFor(code: string): string {
  const i = COUNTRIES.findIndex((c) => c.code === code);
  return String(i + 1).padStart(3, "0");
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) notFound();

  const concerns = await getConcernsByCountry(country.code, 40);
  const url = `${SITE_URL}/world/${country.code}`;
  const fileNo = fileNoFor(country.code);

  // Topic mix — shows what this country tends to fear.
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
    name: `Concerns from ${country.name}`,
    description: `Anonymous concerns submitted by people in ${country.name}.`,
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
      numberOfItems: concerns.length,
      itemListElement: concerns.slice(0, 10).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
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
          Concerns from
          <br />
          <span className="not-italic">{country.name}</span>
          <span className="italic">.</span>
        </h1>

        <p className="mt-10 max-w-2xl font-serif text-xl leading-snug text-ink-mid sm:text-2xl">
          {concerns.length > 0 ? (
            <>
              {concerns.length} anonymous{" "}
              {concerns.length === 1 ? "voice" : "voices"} from{" "}
              {country.name}, in the order they arrived. Each entry is a single
              sentence, written by one person, never edited and never removed.
            </>
          ) : (
            <>
              The record from {country.name} is empty. Be the first voice to
              go on permanent record from here.
            </>
          )}
        </p>

        <StatRow
          tone="paper"
          items={[
            {
              label: "voices recorded",
              value: concerns.length.toLocaleString(),
              accent: "blood",
            },
            {
              label: "country code",
              value: country.code,
            },
            {
              label: "top concern",
              value: topTopics[0]
                ? CATEGORY_LABELS[topTopics[0][0]].split(" ")[0]
                : "—",
              accent: "amber",
            },
            {
              label: "last entry",
              value: latest ? relativeDate(latest.ts) : "—",
            },
          ]}
        />

        {concerns.length > 0 ? (
          <ol className="mt-20 space-y-14">
            {concerns.map((c, i) => (
              <li key={c.id} className="relative">
                <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/40">
                  no. {String(i + 1).padStart(3, "0")} — anon dispatch
                </div>
                <blockquote className="mt-3 font-serif text-2xl leading-[1.18] text-ink sm:text-3xl">
                  &ldquo;{c.text}&rdquo;
                </blockquote>
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
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-20 border-t border-ink/15 pt-12">
            <p className="font-serif text-2xl italic leading-snug text-ink-mid sm:text-3xl">
              The record from {country.name} is unwritten.
              <br />
              The first voice from here could be yours.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
            >
              <span className="relative">
                ↓ add your voice
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-blood transition-transform duration-500" />
              </span>
              <span className="text-ink/40">it takes 30 seconds</span>
            </Link>
          </div>
        )}

        <section className="mt-24 border-t border-ink/15 pt-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
            § appendix — about this dossier
          </div>
          <h2 className="mt-4 font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
            About the record from {country.name}
          </h2>
          <div className="mt-6 grid gap-8 font-sans text-base leading-relaxed text-ink-soft sm:grid-cols-2 sm:text-lg">
            <p>
              Every entry above was written anonymously by one person in{" "}
              {country.name}. They were not edited. They were not curated. They
              are shown in the order they were submitted. Concerns submitted in
              other languages were translated into English on the way in; the
              originals are preserved on the record.
            </p>
            <p>
              If something here is also true for you,{" "}
              <Link
                href="/"
                className="text-ink underline-offset-4 hover:underline"
              >
                add your own voice
              </Link>{" "}
              or{" "}
              <Link
                href="/world"
                className="text-ink underline-offset-4 hover:underline"
              >
                browse the index of every country
              </Link>
              .
            </p>
          </div>

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
          "an anonymous global record",
          "one voice · one entry",
          "no names · no accounts",
          "the world is listening",
        ]}
      />
    </PageBg>
  );
}
