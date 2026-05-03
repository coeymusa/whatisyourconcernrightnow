import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, findCountry } from "../../lib/countries";
import { fetchByCountry, hasSupabase } from "../../lib/supabase";
import {
  CATEGORY_LABELS,
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

type Props = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return COUNTRIES.map((c) => ({ code: c.code.toLowerCase() }));
}

function relativeDate(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (30 * 86400))}mo ago`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) return { title: "country not found" };
  const url = `${SITE_URL}/world/${code.toLowerCase()}`;
  return {
    title: `${country.name} — anonymous concerns from ${country.name}`,
    description: `What people in ${country.name} are afraid of, anonymously. An anonymous record of voices from ${country.name} on whatisyourconcern.com — one person, one voice, owned by nobody.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Anonymous concerns from ${country.name}`,
      description: `Voices from ${country.name} on the record. The world is listening.`,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Anonymous concerns from ${country.name}`,
      description: `Voices from ${country.name} on the record.`,
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) notFound();

  // canonicalise lowercase URL — uppercase /world/US would otherwise duplicate
  // for crawlers. The static-params list is already lowercase so this is just
  // a safety check.
  const upper = country.code.toUpperCase();
  const url = `${SITE_URL}/world/${country.code.toLowerCase()}`;

  const rows = hasSupabase() ? await fetchByCountry(upper, 50) : [];
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
      { "@type": "ListItem", position: 2, name: "By country", item: `${SITE_URL}/world` },
      { "@type": "ListItem", position: 3, name: country.name, item: url },
    ],
  };

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `Anonymous concerns from ${country.name}`,
    description: `What people in ${country.name} are afraid of, anonymously.`,
    isPartOf: { "@id": `${SITE_URL}/#site` },
    about: { "@type": "Country", name: country.name, identifier: upper },
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

      <TopBar
        tone="paper"
        middle={`vol. I · the record · ${upper}`}
      />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text={`country · ${upper}`} />

        <Breadcrumb
          tone="paper"
          crumbs={[
            { label: "home", href: "/" },
            { label: "by country", href: "/world" },
            { label: country.name.toLowerCase() },
          ]}
        />

        <SectionMark tone="paper">
          § the record — {country.name.toLowerCase()}
        </SectionMark>

        <h1 className="mt-8 font-serif text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.04] text-ink">
          what {country.name} is<br />
          <span className="italic text-blood">afraid of, right now.</span>
        </h1>

        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Anonymous voices from {country.name}, on the record. One person ·
          one entry · owned by nobody. The world is listening.
        </p>

        {concerns.length === 0 ? (
          <section className="mt-16 border-t border-ink/15 pt-10">
            <p className="font-serif text-2xl italic text-ink-soft">
              {country.name} hasn&rsquo;t spoken yet.
            </p>
            <p className="mt-3 font-sans text-base text-ink/65">
              Be the first voice from {country.name}.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
            >
              <span className="relative">
                ↓ add a voice from {country.name.toLowerCase()}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-blood" />
              </span>
            </Link>
          </section>
        ) : (
          <section className="mt-16 border-t border-ink/15 pt-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
              § {concerns.length} {concerns.length === 1 ? "voice" : "voices"} on
              the record
            </div>
            <ol className="mt-8 space-y-10">
              {concerns.map((c, i) => (
                <li key={c.id} className="border-l-2 border-blood/30 pl-5 sm:pl-7">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/45">
                    no. {String(i + 1).padStart(3, "0")} —{" "}
                    {CATEGORY_LABELS[c.category].toLowerCase()}
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
              ))}
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
            href="/world"
            className="group inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/65 hover:text-ink"
          >
            <span>browse other countries</span>
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

        <Colophon
          tone="paper"
          signature={`vol. I · the record · ${country.name.toLowerCase()}`}
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          `voices from ${country.name.toLowerCase()}`,
          "an anonymous record",
          "no names · no accounts",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
