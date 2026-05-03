import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "featured in — press, mentions & coverage",
  description:
    "Where the record has been mentioned. An anonymous global record of what humanity is afraid of, right now — featured in newsletters, blogs, and conversations around the web.",
  alternates: { canonical: `${SITE_URL}/featured` },
  openGraph: {
    title: "the record · featured in",
    description:
      "Where whatisyourconcern.com has been mentioned around the web.",
    url: `${SITE_URL}/featured`,
    type: "website",
  },
};

type Mention = {
  publication: string;
  author?: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  url: string;
  quote: string;
  section?: string;
};

// Press / mentions, newest first. Manually curated — when a piece runs,
// add an entry here and the page + sitemap pick it up automatically.
const MENTIONS: Mention[] = [
  {
    publication: "Chaos & Amazement",
    author: "Cathy Lou Willaerts",
    title: "Chaos & Amazement #2618 — Vine is Back, OpenAI has Goblins, and Lovable has an app",
    date: "2026-05-02",
    url: "https://clowillaerts.substack.com/p/chaos-and-amazement-2618-vine-is",
    section: "Weird and wonderful",
    quote:
      "a website that collects one concern per person, from anywhere in the world, forever, owned by nobody. No replies, no metrics, no ads.",
  },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FeaturedPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Featured in", item: `${SITE_URL}/featured` },
    ],
  };

  // emit one Article schema per mention so search engines can connect this
  // page to the originating publication.
  const articles = MENTIONS.map((m) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: m.title,
    url: m.url,
    datePublished: m.date,
    author: m.author ? { "@type": "Person", name: m.author } : undefined,
    publisher: { "@type": "Organization", name: m.publication },
    mentions: { "@id": `${SITE_URL}/#site` },
    isBasedOn: { "@id": `${SITE_URL}/#site` },
  }));

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {articles.map((a, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(a) }}
        />
      ))}

      <TopBar tone="paper" middle="vol. I · the record · featured in" />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="featured in" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "featured in" }]}
        />

        <SectionMark tone="paper">§ featured in</SectionMark>

        <h1 className="mt-6 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] text-ink">
          where the record<br />
          <span className="italic text-blood">has been heard.</span>
        </h1>

        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Mentions of <em>the record</em> around the web. The site has no
          inbox, no PR list, no press kit — these surfaced on their own.
        </p>

        <ol className="mt-16 space-y-16 border-t border-ink/15 pt-12">
          {MENTIONS.map((m, i) => (
            <li key={m.url} className="border-l-2 border-blood/30 pl-5 sm:pl-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/45">
                no. {String(i + 1).padStart(2, "0")} · {fmtDate(m.date)}
              </div>
              <h2 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl">
                {m.publication}
                {m.author && (
                  <span className="font-mono text-base font-normal not-italic text-ink/55">
                    {" "}— by {m.author}
                  </span>
                )}
              </h2>
              <blockquote className="mt-4 font-serif text-xl italic leading-snug text-ink-soft sm:text-2xl">
                &ldquo;{m.quote}&rdquo;
              </blockquote>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-baseline gap-2 text-ink/75 hover:text-ink"
                >
                  <span>read the piece</span>
                  <span className="text-blood">→</span>
                </a>
                {m.section && <span className="text-ink/40">{m.section}</span>}
                <span className="text-ink/40">{m.title}</span>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-20 max-w-2xl border-t border-ink/15 pt-10 font-serif text-base italic leading-relaxed text-ink/55">
          If you&rsquo;ve written about the record and you&rsquo;d like to be
          listed here, link to whatisyourconcern.com — that&rsquo;s how it
          gets found.
        </p>

        <div className="mt-16 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-ink/15 pt-10">
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
            href="/topics"
            className="group inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/65 hover:text-ink"
          >
            <span>browse by topic</span>
            <span className="text-blood">→</span>
          </Link>
        </div>

        <Colophon tone="paper" signature="vol. I · featured in" />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "the record · featured in",
          "the world is listening",
          "no names · no accounts",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
