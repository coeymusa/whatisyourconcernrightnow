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

const SITE_URL = "https://whatisyourconcern.com";

export const metadata: Metadata = {
  title: "Press kit",
  description:
    "Press kit for what is your concern? — an anonymous global record of human concern. Fact sheet, sample dispatches, and contact information for journalists, researchers, and writers.",
  alternates: { canonical: `${SITE_URL}/press` },
  openGraph: {
    title: "Press kit · what is your concern?",
    description:
      "Fact sheet, sample dispatches, and contact information for journalists.",
    url: `${SITE_URL}/press`,
    type: "article",
  },
};

export const revalidate = 600;

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Press kit", item: `${SITE_URL}/press` },
  ],
};

export default async function PressPage() {
  const supabaseOn = hasSupabase();
  const [recentRows, countryCounts, categoryCounts] = await Promise.all([
    supabaseOn ? fetchRecent(40, 0, 0) : Promise.resolve([]),
    supabaseOn ? fetchCountryCounts() : Promise.resolve(new Map<string, number>()),
    supabaseOn ? fetchCategoryCounts() : Promise.resolve(new Map<string, number>()),
  ]);

  const concerns: Concern[] = recentRows.map((r) => ({
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
  const topCategory = [...categoryCounts.entries()]
    .filter(([k]) => k !== "other")
    .sort((a, b) => b[1] - a[1])[0];

  // Curate quotable dispatches — pick a spread across countries and ages.
  const seenCountry = new Set<string>();
  const quotable: Concern[] = [];
  for (const c of concerns) {
    if (c.text.length < 40 || c.text.length > 180) continue;
    if (seenCountry.has(c.countryCode)) continue;
    seenCountry.add(c.countryCode);
    quotable.push(c);
    if (quotable.length >= 8) break;
  }

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar tone="paper" middle="vol. I · § P — press kit" />

      <article className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="file no. P — press kit" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "press" }]}
        />

        <SectionMark tone="paper">
          § P — press kit · for journalists & researchers
        </SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5.5rem)] italic leading-[0.95] tracking-[-0.01em]">
          Press
          <span className="not-italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          A fact sheet for journalists, researchers, and writers covering{" "}
          <em>what is your concern?</em>. Quote freely; the entries are
          public domain by design.
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
              label: "loudest topic",
              value: topCategory
                ? CATEGORY_LABELS[topCategory[0] as ConcernCategory].split(
                    " ",
                  )[0]
                : "—",
            },
            {
              label: "founded",
              value: "2026",
            },
          ]}
        />

        {/* §  Fact sheet */}
        <Section number="I" title="Fact sheet">
          <Fact label="What it is">
            <em>what is your concern?</em> is an anonymous, global record
            of what humanity is afraid of. Contributors submit a single
            sentence describing what they fear — for their family, their
            country, their species — accompanied only by an age and a
            country. Each entry is plotted on a 3D globe.
          </Fact>
          <Fact label="What it is not">
            Not a forum, not a feed, not a social network, not a
            dashboard. There are no usernames, accounts, profiles, likes,
            or recommendations. The site does not measure success in time
            spent on page.
          </Fact>
          <Fact label="Anonymity">
            We do not collect names, email addresses, IP addresses, or
            browser fingerprints linked to a contributor. A one-way hash
            is used only to enforce rate limits and is not stored against
            the published concern. We cannot work backward from a
            published entry to its author.
          </Fact>
          <Fact label="Translation">
            Concerns submitted in non-English languages are translated
            into English so the record is readable globally. The original
            text and detected language are preserved.
          </Fact>
          <Fact label="Moderation">
            We block direct threats, doxing, CSAM, and commercial spam.
            We do not block submissions for being upsetting, politically
            inconvenient, or unfashionable. The record is meant to capture
            what people are actually afraid of.
          </Fact>
          <Fact label="Funding">
            The site has no investors, no advertisers, and no AI training
            partner. It is funded out of pocket and supported by readers.
          </Fact>
          <Fact label="Architecture">
            Next.js on Vercel; PostgreSQL via Supabase; Equal Earth map
            projection; world-atlas country boundaries. Fonts: Instrument
            Serif, JetBrains Mono, Geist.
          </Fact>
        </Section>

        {/* §  Quotable dispatches */}
        {quotable.length > 0 && (
          <section className="mt-20">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                § II
              </span>
              <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
                Quotable dispatches
              </h2>
            </div>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
              A spread of recent submissions across countries and ages —
              quote freely. Attribution is by country and age bracket only;
              no contributor can be identified.
            </p>

            <ol className="mt-10 space-y-10">
              {quotable.map((c, i) => {
                const country = findCountry(c.countryCode);
                return (
                  <li key={c.id} className="border-l-2 border-blood/30 pl-5 sm:pl-7">
                    <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/40">
                      no. {String(i + 1).padStart(2, "0")} — {country?.name ?? c.countryCode} · ages {c.bracket}
                    </div>
                    <blockquote className="mt-3 font-serif text-2xl leading-[1.2] text-ink sm:text-[28px]">
                      &ldquo;{c.text}&rdquo;
                    </blockquote>
                    <Link
                      href={`/dispatch/${c.id}`}
                      className="mt-3 inline-flex font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55 hover:text-ink"
                    >
                      permalink → /dispatch/{c.id.slice(0, 8)}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* §  Brand */}
        <Section number="III" title="Brand & assets">
          <Fact label="Site name">
            <code className="font-mono text-sm text-ink">
              what is your concern?
            </code>{" "}
            — lowercase, with the question mark.
          </Fact>
          <Fact label="Domain">
            <a
              href="https://whatisyourconcern.com"
              className="text-ink underline-offset-4 hover:underline"
            >
              whatisyourconcern.com
            </a>
          </Fact>
          <Fact label="Open Graph card">
            Every dossier and dispatch has a custom 1200×630 PNG card.
            Right-click → Save as on{" "}
            <a
              href="/opengraph-image"
              className="text-ink underline-offset-4 hover:underline"
            >
              the homepage card
            </a>
            ,{" "}
            <a
              href="/world/US/opengraph-image"
              className="text-ink underline-offset-4 hover:underline"
            >
              a country card
            </a>
            , or{" "}
            <a
              href="/topics/climate/opengraph-image"
              className="text-ink underline-offset-4 hover:underline"
            >
              a topic card
            </a>
            .
          </Fact>
          <Fact label="Palette">
            <code className="font-mono text-sm">#0a0908</code> ink ·{" "}
            <code className="font-mono text-sm">#f1ece2</code> paper ·{" "}
            <code className="font-mono text-sm">#c7321b</code> blood ·{" "}
            <code className="font-mono text-sm">#d4a24a</code> amber
          </Fact>
        </Section>

        {/* §  Contact */}
        <Section number="IV" title="Contact">
          <p>
            For interviews, comment, or research access, reach out to{" "}
            <a
              href="https://coreymusa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-4 hover:underline"
            >
              Corey Musa
            </a>{" "}
            (founder).
          </p>
          <p>
            The site itself has no inbox; it only listens. There is no
            press desk, no PR firm, no embargo policy.
          </p>
        </Section>

        {/* §  Read next */}
        <div className="mt-20 grid gap-6 border-t border-ink/15 pt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 sm:grid-cols-3 sm:gap-12">
          <div>
            <div className="text-ink/40">background</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/about" className="hover:text-ink">
                about the record →
              </Link>
            </p>
          </div>
          <div>
            <div className="text-ink/40">how it's built</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/methodology" className="hover:text-ink">
                methodology →
              </Link>
            </p>
          </div>
          <div>
            <div className="text-ink/40">live state</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/pulse" className="hover:text-ink">
                the pulse →
              </Link>
            </p>
          </div>
        </div>

        <Colophon
          tone="paper"
          signature="vol. I · file P · press kit — fin."
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "press kit",
          "quote freely · attribute by country",
          "the record is the artifact",
          "anonymous · permanent · global",
        ]}
      />
    </PageBg>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-20">
      <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
          § {number}
        </span>
        <h2 className="font-serif text-3xl italic leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
      </div>
      <div className="mt-6 space-y-5 font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
        {children}
      </div>
    </section>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
        {label}
      </div>
      <p className="mt-2 leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
