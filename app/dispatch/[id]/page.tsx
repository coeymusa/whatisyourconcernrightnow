import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findCountry } from "../../lib/countries";
import {
  fetchByCountry,
  fetchConcernById,
  fetchSolutionsByConcernId,
  hasSupabase,
} from "../../lib/supabase";
import {
  CATEGORY_LABELS,
  type Concern,
  type ConcernCategory,
  type Solution,
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
export const dynamicParams = true;
export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

async function loadConcern(id: string): Promise<Concern | null> {
  if (!hasSupabase()) return null;
  const r = await fetchConcernById(id);
  if (!r) return null;
  return {
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
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = await loadConcern(id);
  if (!c) return { title: "dispatch not found" };
  const country = findCountry(c.countryCode);
  const url = `${SITE_URL}/dispatch/${id}`;
  const trim = c.text.length > 80 ? `${c.text.slice(0, 78)}…` : c.text;
  return {
    title: `"${trim}" — anon dispatch from ${country?.name ?? c.countryCode}`,
    description: `An anonymous concern from ${country?.name ?? c.countryCode} on the record. ${trim}`,
    alternates: { canonical: url },
    openGraph: {
      title: `Anon dispatch from ${country?.name ?? c.countryCode}`,
      description: c.text,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Anon dispatch from ${country?.name ?? c.countryCode}`,
      description: c.text,
    },
  };
}

function relativeDate(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (30 * 86400))}mo ago`;
}

export default async function DispatchPage({ params }: Props) {
  const { id } = await params;
  const concern = await loadConcern(id);
  if (!concern) notFound();

  const country = findCountry(concern.countryCode);
  const url = `${SITE_URL}/dispatch/${id}`;

  // Related dispatches from the same country + the responses thread for
  // this specific concern.
  const [relatedRows, solutionRows] = await Promise.all([
    hasSupabase() ? fetchByCountry(concern.countryCode, 6) : Promise.resolve([]),
    hasSupabase() ? fetchSolutionsByConcernId(id, 30) : Promise.resolve([]),
  ]);
  const related = relatedRows
    .filter((r) => r.id !== id)
    .slice(0, 4)
    .map(
      (r): Concern => ({
        id: r.id,
        age: r.age,
        bracket: r.bracket as Concern["bracket"],
        countryCode: r.country_code,
        text: r.text,
        category: r.category as ConcernCategory,
        ts: new Date(r.created_at).getTime(),
      }),
    );
  const solutions: Solution[] = solutionRows.map((s) => ({
    id: s.id,
    concernId: s.concern_id,
    age: s.age,
    bracket: s.bracket as Solution["bracket"],
    countryCode: s.country_code,
    text: s.text,
    ts: new Date(s.created_at).getTime(),
  }));

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      country
        ? {
            "@type": "ListItem",
            position: 2,
            name: country.name,
            item: `${SITE_URL}/world/${country.code}`,
          }
        : null,
      {
        "@type": "ListItem",
        position: country ? 3 : 2,
        name: "dispatch",
        item: url,
      },
    ].filter(Boolean),
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": url,
    name: concern.text.slice(0, 100),
    text: concern.text,
    inLanguage: "en",
    dateCreated: new Date(concern.ts).toISOString(),
    locationCreated: country
      ? { "@type": "Country", name: country.name, identifier: country.code }
      : undefined,
    author: { "@type": "Person", name: "Anonymous" },
    publisher: { "@id": `${SITE_URL}/#org` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />

      <TopBar
        tone="paper"
        middle={`vol. I · anon dispatch · ${concern.countryCode}`}
      />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark
          tone="paper"
          text={`anon dispatch · ${id.slice(-6)}`}
        />

        <Breadcrumb
          tone="paper"
          crumbs={[
            { label: "home", href: "/" },
            country
              ? { label: country.name.toLowerCase(), href: `/world/${country.code}` }
              : { label: "dispatch" },
            { label: "dispatch" },
          ]}
        />

        <SectionMark tone="paper">
          § anon dispatch — {country?.name.toLowerCase() ?? concern.countryCode}
        </SectionMark>

        <blockquote className="mt-10 font-serif text-[clamp(2rem,5.5vw,4.5rem)] italic leading-[1.05] text-ink">
          &ldquo;{concern.text}&rdquo;
        </blockquote>

        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/15 pt-5 font-mono text-xs uppercase tracking-[0.22em] text-ink/60 sm:text-[13px]">
          <span>anonymous</span>
          <span className="text-ink/30">·</span>
          {country ? (
            <Link
              href={`/world/${country.code}`}
              className="hover:text-ink"
            >
              {country.name}
            </Link>
          ) : (
            <span>{concern.countryCode}</span>
          )}
          <span className="text-ink/30">·</span>
          <span>ages {concern.bracket}</span>
          <span className="text-ink/30">·</span>
          <Link
            href={`/topics/${concern.category}`}
            className="hover:text-ink"
          >
            {CATEGORY_LABELS[concern.category].toLowerCase()}
          </Link>
          <span className="text-ink/30">·</span>
          <span>{relativeDate(concern.ts)}</span>
        </div>

        <p className="mt-12 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          This dispatch was submitted anonymously to <em>the record</em>.
          The contributor is not named, not tracked, and cannot be
          identified by reading the entry. The text is preserved exactly as
          they wrote it. There are{" "}
          <Link
            href={country ? `/world/${country.code}` : "/world"}
            className="text-ink underline-offset-4 hover:underline"
          >
            other dispatches from {country?.name ?? "around the world"}
          </Link>{" "}
          and{" "}
          <Link
            href={`/topics/${concern.category}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            other dispatches on {CATEGORY_LABELS[concern.category].toLowerCase()}
          </Link>
          .
        </p>

        {solutions.length > 0 && (
          <section className="mt-20 border-t border-ink/15 pt-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
              § responses — {solutions.length}{" "}
              {solutions.length === 1 ? "voice" : "voices"} answering
            </div>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              Anonymous responses to this dispatch from people elsewhere on
              the record. They speak to the dispatch, not for it.
            </p>
            <ol className="mt-8 space-y-10">
              {solutions.map((s, i) => {
                const sCountry = findCountry(s.countryCode);
                return (
                  <li
                    key={s.id}
                    className="border-l-2 border-amber/50 pl-5 sm:pl-7"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/45">
                      no. {String(i + 1).padStart(2, "0")} — answer
                    </div>
                    <blockquote className="mt-3 font-serif text-xl leading-snug text-ink sm:text-2xl">
                      &ldquo;{s.text}&rdquo;
                    </blockquote>
                    <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                      {sCountry?.name ?? s.countryCode} · ages {s.bracket} ·{" "}
                      {relativeDate(s.ts)}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-20 border-t border-ink/15 pt-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
              § related — from the same country
            </div>
            <ul className="mt-6 space-y-8">
              {related.map((r) => (
                <li
                  key={r.id}
                  className="border-l-2 border-blood/30 pl-5 sm:pl-7"
                >
                  <Link
                    href={`/dispatch/${r.id}`}
                    className="block font-serif text-xl leading-snug text-ink-soft hover:text-ink sm:text-2xl"
                  >
                    &ldquo;{r.text}&rdquo;
                  </Link>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                    ages {r.bracket} · {CATEGORY_LABELS[r.category].toLowerCase()} · {relativeDate(r.ts)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-20 border-t border-ink/15 pt-10">
          <Link
            href="/"
            className="group inline-flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink"
          >
            <span className="relative">
              ↓ add your own voice
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-blood" />
            </span>
            <span className="text-ink/40">it takes 30 seconds</span>
          </Link>
        </div>

        <Colophon
          tone="paper"
          signature={`vol. I · anon dispatch · ${id.slice(-6)} — fin.`}
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "an anonymous record",
          "the world is listening",
          "no names · no accounts",
          "share this dispatch",
        ]}
      />
    </PageBg>
  );
}
