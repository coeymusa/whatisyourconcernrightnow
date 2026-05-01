import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../lib/types";
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
  title: "Concerns by topic",
  description:
    "Browse anonymous global concerns by topic — climate, economy, democracy, loneliness, AI, war, and more. What is the world afraid of, by category?",
  alternates: { canonical: `${SITE_URL}/topics` },
  openGraph: {
    title: "Concerns by topic · what is your concern?",
    description:
      "Browse anonymous global concerns by topic — climate, economy, democracy, loneliness, AI, war.",
    url: `${SITE_URL}/topics`,
    type: "website",
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
      name: "Concerns by topic",
      item: `${SITE_URL}/topics`,
    },
  ],
};

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

export default function TopicsDirectoryPage() {
  const topics = CATEGORY_ORDER.filter((c) => c !== "other");

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar tone="paper" middle="vol. I · § X — index by topic" />

      <article className="relative mx-auto max-w-5xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="file no. X — topic index" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "topics" }]}
        />

        <SectionMark tone="paper">§ X — index by topic</SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5.5rem)] italic leading-[0.95] tracking-[-0.01em]">
          Concerns by
          <br />
          <span className="not-italic">topic</span>
          <span className="italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          What is the world afraid of, by category? Pick a topic to read what
          people across every country have written about it.
        </p>

        <ul className="mt-16 grid gap-10 border-t border-ink/15 pt-12 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
          {topics.map((cat, i) => (
            <li key={cat}>
              <Link
                href={`/topics/${cat}`}
                className="group block"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                    topic
                  </span>
                </div>
                <h2 className="mt-2 font-serif text-3xl italic leading-tight text-ink transition group-hover:text-blood sm:text-4xl">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <p className="mt-4 font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
                  {TOPIC_BLURB[cat]}
                </p>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55 transition group-hover:text-ink">
                  read the dossier →
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Colophon
          tone="paper"
          signature="vol. I · file X · topic index — fin."
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "11 dossiers · one record",
          "the world is listening",
          "no names · no accounts",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
