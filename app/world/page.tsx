import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES } from "../lib/countries";
import { fetchRecent, hasSupabase } from "../lib/supabase";
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
  title: "the record by country — anonymous concerns from around the world",
  description:
    "Browse anonymous concerns by country. Every nation, every voice. An anonymous global record of what humanity is afraid of, right now.",
  alternates: { canonical: `${SITE_URL}/world` },
  openGraph: {
    title: "the record · by country",
    description:
      "Browse anonymous concerns from every country in the world.",
    url: `${SITE_URL}/world`,
    type: "website",
  },
};

const REGIONS: { name: string; codes: string[] }[] = [
  {
    name: "North America & Caribbean",
    codes: [
      "US", "CA", "MX", "GL", "CU", "HT", "DO", "JM", "BS", "PR", "TT",
      "GT", "HN", "SV", "NI", "CR", "PA", "BZ",
    ],
  },
  {
    name: "South America",
    codes: ["BR", "AR", "CL", "CO", "PE", "VE", "BO", "EC", "PY", "UY", "GY", "SR", "GF", "FK"],
  },
  {
    name: "Western & Northern Europe",
    codes: [
      "GB", "IE", "FR", "DE", "ES", "PT", "IT", "NL", "BE", "CH", "AT",
      "LU", "LI", "MC", "AD", "SM", "VA", "MT", "SE", "NO", "DK", "FI", "IS",
    ],
  },
];

export default async function WorldDirectoryPage() {
  // grab a population-of-voices count per country to show next to each link.
  // soft cap — this is a directory page, not a feed.
  const rows = hasSupabase() ? await fetchRecent(500, 0, 0) : [];
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.country_code, (counts.get(r.country_code) ?? 0) + 1);
  }

  // group every country we surface, region known or not.
  const seen = new Set(REGIONS.flatMap((r) => r.codes));
  const restCodes = COUNTRIES.map((c) => c.code).filter((c) => !seen.has(c));
  const allRegions = [
    ...REGIONS,
    { name: "Rest of the world", codes: restCodes },
  ];

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "By country", item: `${SITE_URL}/world` },
    ],
  };
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/world`,
    name: "the record · by country",
    url: `${SITE_URL}/world`,
    isPartOf: { "@id": `${SITE_URL}/#site` },
    description:
      "Anonymous concerns from every country in the world, browsable by nation.",
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

      <TopBar tone="paper" middle="vol. I · the record · by country" />

      <article className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="the record · by country" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "by country" }]}
        />

        <SectionMark tone="paper">§ the record — by country</SectionMark>

        <h1 className="mt-6 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] text-ink">
          every nation,<br />
          <span className="italic text-blood">every voice.</span>
        </h1>

        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Browse anonymous concerns from every country we&rsquo;ve heard
          from. One person · one voice · one entry, owned by nobody.
          The world is listening.
        </p>

        {allRegions.map((region) => {
          const codes = region.codes.filter((c) =>
            COUNTRIES.some((co) => co.code === c),
          );
          if (codes.length === 0) return null;
          return (
            <section key={region.name} className="mt-16 border-t border-ink/15 pt-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § {region.name.toLowerCase()}
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 font-sans text-base text-ink-soft sm:grid-cols-3 sm:text-lg lg:grid-cols-4">
                {codes
                  .map((code) => COUNTRIES.find((c) => c.code === code)!)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => {
                    const n = counts.get(c.code) ?? 0;
                    return (
                      <li key={c.code}>
                        <Link
                          href={`/world/${c.code.toLowerCase()}`}
                          className="group inline-flex items-baseline gap-2 hover:text-ink"
                        >
                          <span>{c.name}</span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/40">
                            {n > 0 ? `${n}` : "·"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </section>
          );
        })}

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
            href="/topics"
            className="group inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/65 hover:text-ink"
          >
            <span>browse by topic</span>
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

        <Colophon tone="paper" signature="vol. I · the record · by country" />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "the record · by country",
          "every nation, every voice",
          "no names · no accounts",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
