import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findCountry } from "../../lib/countries";
import { fetchByCategory, hasSupabase } from "../../lib/supabase";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type Concern,
  type ConcernCategory,
} from "../../lib/types";
import {
  Breadcrumb,
  Colophon,
  CornerMark,
  Marquee,
  PageBg,
  SectionMark,
  TopBar,
} from "../../components/editorial";

const SITE_URL = "https://whatisyourconcern.com";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CATEGORY_ORDER.map((c) => ({ slug: c }));
}

const TOPIC_DESCRIPTIONS: Record<ConcernCategory, string> = {
  economy:
    "Anonymous voices on the cost of living, jobs, wages, and what money is doing to people right now.",
  climate:
    "Anonymous voices on heat, fire, flood, and what the planet is doing to people right now.",
  war: "Anonymous voices on war and violence — from inside it, from beside it, from far from it.",
  democracy:
    "Anonymous voices on democracy, freedom, authoritarianism, and who gets to decide.",
  health:
    "Anonymous voices on sickness, healthcare, and the cost of staying alive.",
  ai: "Anonymous voices on artificial intelligence, automation, and machines that read, write, replace, watch.",
  loneliness:
    "Anonymous voices on loneliness, meaning, and the quiet kind nobody names out loud.",
  housing:
    "Anonymous voices on rent, mortgage, eviction, and where to sleep.",
  inequality:
    "Anonymous voices on inequality — who has, who doesn't, why.",
  education:
    "Anonymous voices on school, children, and the world they're inheriting.",
  future:
    "Anonymous voices on the future itself — the thing nobody can promise anymore.",
  other:
    "Anonymous voices on everything that doesn't fit a label.",
};

function relativeDate(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (30 * 86400))}mo ago`;
}

function isCategory(s: string): s is ConcernCategory {
  return (CATEGORY_ORDER as string[]).includes(s);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isCategory(slug)) return { title: "topic not found" };
  const url = `${SITE_URL}/topics/${slug}`;
  const label = CATEGORY_LABELS[slug];
  return {
    title: `${label.toLowerCase()} — anonymous concerns about ${label.toLowerCase()}`,
    description: TOPIC_DESCRIPTIONS[slug],
    alternates: { canonical: url },
    openGraph: {
      title: `Anonymous concerns about ${label.toLowerCase()}`,
      description: TOPIC_DESCRIPTIONS[slug],
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Anonymous concerns about ${label.toLowerCase()}`,
      description: TOPIC_DESCRIPTIONS[slug],
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();

  const url = `${SITE_URL}/topics/${slug}`;
  const label = CATEGORY_LABELS[slug];

  const rows = hasSupabase() ? await fetchByCategory(slug, 60) : [];
  const concerns: Concern[] = rows.map((r) => ({
    id: r.id,
    age: r.age,
    bracket: r.bracket as Concern["bracket"],
    countryCode: r.country_code,
    text: r.text,
    category: r.category as ConcernCategory,
    ts: new Date(r.created_at).getTime(),
    score: r.score ?? 0,
    upvotes: r.upvotes ?? 0,
    downvotes: r.downvotes ?? 0,
  }));

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "By topic", item: `${SITE_URL}/topics` },
      { "@type": "ListItem", position: 3, name: label, item: url },
    ],
  };

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `Anonymous concerns about ${label.toLowerCase()}`,
    description: TOPIC_DESCRIPTIONS[slug],
    isPartOf: { "@id": `${SITE_URL}/#site` },
    about: { "@type": "Thing", name: label },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: concerns.length,
      itemListElement: concerns.slice(0, 20).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/dispatch/${c.id}`,
        name: c.text.slice(0, 100),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />

      <TopBar tone="paper" middle={`vol. I · the record · ${slug}`} />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text={`topic · ${slug}`} />

        <Breadcrumb
          tone="paper"
          crumbs={[
            { label: "home", href: "/" },
            { label: "by topic", href: "/topics" },
            { label: label.toLowerCase() },
          ]}
        />

        <SectionMark tone="paper">
          § the record — {label.toLowerCase()}
        </SectionMark>

        <h1 className="mt-8 font-serif text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.04] text-ink">
          {label.toLowerCase()},<br />
          <span className="italic text-blood">on the record.</span>
        </h1>

        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          {TOPIC_DESCRIPTIONS[slug]}
        </p>

        {concerns.length === 0 ? (
          <section className="mt-16 border-t border-ink/15 pt-10">
            <p className="font-serif text-2xl italic text-ink-soft">
              no voices yet on {label.toLowerCase()}.
            </p>
            <p className="mt-3 font-sans text-base text-ink/65">
              Be the first.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
            >
              <span className="relative">
                ↓ add the first voice
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-blood" />
              </span>
            </Link>
          </section>
        ) : (
          <section className="mt-16 border-t border-ink/15 pt-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
              § {concerns.length} {concerns.length === 1 ? "voice" : "voices"} on{" "}
              {label.toLowerCase()}
            </div>
            <ol className="mt-8 space-y-10">
              {concerns.map((c, i) => {
                const country = findCountry(c.countryCode);
                return (
                  <li
                    key={c.id}
                    className="border-l-2 border-blood/30 pl-5 sm:pl-7"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/45">
                      no. {String(i + 1).padStart(3, "0")} ·{" "}
                      {country?.name ?? c.countryCode}
                    </div>
                    <Link
                      href={`/dispatch/${c.id}`}
                      className="mt-3 block font-serif text-xl leading-snug text-ink hover:text-ink sm:text-2xl"
                    >
                      &ldquo;{c.text}&rdquo;
                    </Link>
                    <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      ages {c.bracket} · {relativeDate(c.ts)}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

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
            <span>browse other topics</span>
            <span className="text-blood">→</span>
          </Link>
          <Link
            href="/world"
            className="group inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/65 hover:text-ink"
          >
            <span>browse by country</span>
            <span className="text-blood">→</span>
          </Link>
        </div>

        <Colophon
          tone="paper"
          signature={`vol. I · the record · ${label.toLowerCase()}`}
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          `voices on ${label.toLowerCase()}`,
          "an anonymous record",
          "no names · no accounts",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
