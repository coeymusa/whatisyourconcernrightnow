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
  title: "Methodology",
  description:
    "How concerns are collected, attributed, translated, moderated, and displayed on whatisyourconcern.com — the technical and editorial methodology of the record.",
  alternates: { canonical: `${SITE_URL}/methodology` },
  openGraph: {
    title: "Methodology · what is your concern?",
    description:
      "How the record is built — collection, attribution, translation, moderation.",
    url: `${SITE_URL}/methodology`,
    type: "article",
  },
};

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Methodology",
      item: `${SITE_URL}/methodology`,
    },
  ],
};

export default function MethodologyPage() {
  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar tone="paper" middle="vol. I · § T — methodology" />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="file no. T — technical appendix" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "methodology" }]}
        />

        <SectionMark tone="paper">§ T — methodology · technical appendix</SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5.5rem)] italic leading-[0.95] tracking-[-0.01em]">
          Methodology
          <span className="not-italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          How the record is collected, attributed, translated, moderated, and
          displayed.
        </p>

        <Section number="01" title="Collection">
          <p>
            Each concern is a single sentence between 4 and 240 characters,
            submitted with an age (13–120) and an ISO-3166 country code. There
            is no account, no email, no name. We collect no other data tied
            to the contributor.
          </p>
        </Section>

        <Section number="02" title="Attribution">
          <p>
            A concern is plotted on a 3D globe at the country it came from.
            Within a country, dots are scattered around the centroid so dense
            countries don't pile every voice on a single point. The age is
            grouped into one of five brackets — 13–19, 20–29, 30–44, 45–59,
            60+ — for filtering. We never display the raw age tied to a
            specific concern.
          </p>
        </Section>

        <Section number="03" title="Translation">
          <p>
            Concerns submitted in languages other than English are translated
            into English so the record is legible to any reader. Translation
            is performed by a large-language-model pipeline tuned for short
            personal text. The original text and detected language are
            preserved alongside the translation.
          </p>
        </Section>

        <Section number="04" title="Moderation">
          <p>
            We block submissions that contain direct threats, doxing, child
            sexual abuse material, or commercial spam. We do not block
            submissions for being upsetting, politically inconvenient, or
            unfashionable. The record is meant to capture what people are
            actually afraid of — including the things they would not say in
            public.
          </p>
          <p>
            Moderation runs in two layers: a heuristic filter at submission
            time, and a manual review queue for anything flagged by readers.
            Once written, the record is permanent — concerns can be hidden
            but not edited.
          </p>
        </Section>

        <Section number="05" title="Rate limits">
          <p>
            We enforce a soft rate limit per request signature so that no
            single person can flood the record. The signature is a one-way
            hash; we cannot reverse it to identify a person, and it is not
            stored against the published concern.
          </p>
        </Section>

        <Section number="06" title="Display">
          <p>
            The map projection is{" "}
            <a
              href="https://en.wikipedia.org/wiki/Equal_Earth_projection"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-4 hover:underline"
            >
              Equal Earth
            </a>
            , chosen because it preserves the relative area of every country —
            the Global South is not visually shrunk relative to the Global
            North, as it is on a Mercator projection. Country boundaries are
            sourced from{" "}
            <a
              href="https://github.com/topojson/world-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-4 hover:underline"
            >
              world-atlas
            </a>{" "}
            (Natural Earth at 50m resolution).
          </p>
        </Section>

        <Section number="07" title="Code">
          <p>
            The site is a Next.js application hosted on Vercel. Concerns are
            stored in PostgreSQL via Supabase. There is no proprietary
            algorithm choosing what you see — concerns are returned in the
            order they arrived, with optional filters by country, topic, and
            age bracket.
          </p>
        </Section>

        <div className="mt-20 grid gap-6 border-t border-ink/15 pt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 sm:grid-cols-3 sm:gap-12">
          <div>
            <div className="text-ink/40">read next</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/manifesto" className="hover:text-ink">
                the manifesto →
              </Link>
            </p>
          </div>
          <div>
            <div className="text-ink/40">about</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/about" className="hover:text-ink">
                about the record →
              </Link>
            </p>
          </div>
          <div>
            <div className="text-ink/40">browse</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/topics" className="hover:text-ink">
                concerns by topic →
              </Link>
            </p>
          </div>
        </div>

        <Colophon
          tone="paper"
          signature="vol. I · file T · methodology — fin."
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "equal earth projection",
          "translated, not edited",
          "no profiling · no tracking",
          "the record is the artifact",
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
    <section className="mt-16">
      <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
          {number}
        </span>
        <h2 className="font-serif text-2xl italic leading-tight text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
        {children}
      </div>
    </section>
  );
}
