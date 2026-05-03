import type { Metadata } from "next";
import Link from "next/link";
import { fetchRecent, hasSupabase } from "../lib/supabase";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ConcernCategory,
} from "../lib/types";
import {
  Breadcrumb,
  Colophon,
  CornerMark,
  Marquee,
  PageBg,
  SectionMark,
  TopBar,
} from "../components/editorial";

const SITE_URL = "https://whatisyourconcern.com";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "the record by topic — what humanity is afraid of",
  description:
    "Browse anonymous concerns by topic — climate, war, democracy, AI, loneliness, housing, inequality, the future itself. The record, sorted.",
  alternates: { canonical: `${SITE_URL}/topics` },
  openGraph: {
    title: "the record · by topic",
    description:
      "Browse anonymous concerns by topic — climate, war, democracy, AI, loneliness, and the future itself.",
    url: `${SITE_URL}/topics`,
    type: "website",
  },
};

const TOPIC_BLURBS: Record<ConcernCategory, string> = {
  economy: "Cost of living, jobs, wages, the price of groceries.",
  climate: "Heat, fire, flood, the planet on the record.",
  war: "Voices that have lived inside it.",
  democracy: "Freedom, authoritarianism, who gets to decide.",
  health: "Sickness, care, the cost of staying alive.",
  ai: "Machines that read, write, replace, watch.",
  loneliness: "The quiet kind. The one no one names out loud.",
  housing: "Rent, mortgage, eviction, where to sleep.",
  inequality: "Who has, who doesn\u2019t, why.",
  education: "School, kids, the world they\u2019re inheriting.",
  future: "The thing nobody can promise anymore.",
  other: "Everything that doesn\u2019t fit a label.",
};

export default async function TopicsDirectoryPage() {
  // pull recent rows once and bucket by category for the count badges.
  const rows = hasSupabase() ? await fetchRecent(500, 0, 0) : [];
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  }

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "By topic", item: `${SITE_URL}/topics` },
    ],
  };
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/topics`,
    url: `${SITE_URL}/topics`,
    name: "the record · by topic",
    description: "Anonymous concerns from around the world, sorted by topic.",
    isPartOf: { "@id": `${SITE_URL}/#site` },
  };

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />

      <TopBar tone="paper" middle="vol. I · the record · by topic" />

      <article className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="the record · by topic" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "by topic" }]}
        />

        <SectionMark tone="paper">§ the record — by topic</SectionMark>

        <h1 className="mt-6 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] text-ink">
          what humanity is<br />
          <span className="italic text-blood">afraid of, sorted.</span>
        </h1>

        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Twelve themes. One person · one voice · one entry. Owned by nobody.
          The world is listening.
        </p>

        <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-ink/15 pt-12 sm:grid-cols-2">
          {CATEGORY_ORDER.map((cat) => {
            const n = counts.get(cat) ?? 0;
            return (
              <li key={cat}>
                <Link href={`/topics/${cat}`} className="group block">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-serif text-3xl italic text-ink group-hover:text-blood sm:text-4xl">
                      {CATEGORY_LABELS[cat].toLowerCase()}
                    </h2>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                      {n > 0 ? `${n} voices` : "·"}
                    </span>
                  </div>
                  <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink/65 sm:text-base">
                    {TOPIC_BLURBS[cat]}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-20 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-ink/15 pt-10">
          <Link
            href="/"
            className="group inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
          >
            <span className="relative">
              ↓ add your own voice
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-blood" />
            </span>
            <span className="text-ink/40">30 seconds</span>
          </Link>
          <Link
            href="/world"
            className="group inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/65 hover:text-ink"
          >
            <span>browse by country</span>
            <span className="text-blood">→</span>
          </Link>
          <Link
            href="/random"
            className="group inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/65 hover:text-ink"
          >
            <span>stumble to a voice</span>
            <span className="text-blood">→</span>
          </Link>
        </div>

        <Colophon tone="paper" signature="vol. I · the record · by topic" />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "the record · by topic",
          "twelve themes",
          "no names · no accounts",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
