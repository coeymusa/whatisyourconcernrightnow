import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES } from "../lib/countries";
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
  title: "Concerns by country",
  description:
    "Browse anonymous concerns from people around the world, organized by country. What is humanity afraid of, country by country?",
  alternates: { canonical: `${SITE_URL}/world` },
  openGraph: {
    title: "Concerns by country · what is your concern?",
    description:
      "Browse anonymous concerns from people around the world, country by country.",
    url: `${SITE_URL}/world`,
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
      name: "Concerns by country",
      item: `${SITE_URL}/world`,
    },
  ],
};

function regionFor(code: string): string {
  if (
    [
      "US","CA","MX","GL","CU","HT","DO","JM","BS","PR","TT","GT","HN","SV","NI","CR","PA","BZ",
    ].includes(code)
  )
    return "I — North America & Caribbean";
  if (
    ["BR","AR","CL","CO","PE","VE","BO","EC","PY","UY","GY","SR","GF","FK"].includes(code)
  )
    return "II — South America";
  if (
    ["GB","IE","FR","DE","ES","PT","IT","NL","BE","CH","AT","LU","LI","MC","AD","SM","VA","MT","SE","NO","DK","FI","IS"].includes(code)
  )
    return "III — Western & Northern Europe";
  if (
    ["PL","CZ","SK","HU","SI","HR","BA","RS","ME","AL","MK","XK","BG","GR","RO","MD","UA","BY","RU","EE","LT","LV"].includes(code)
  )
    return "IV — Eastern Europe";
  if (
    ["TR","CY","IL","PS","LB","JO","SY","IQ","IR","AF","SA","AE","QA","BH","KW","OM","YE","EG","LY","TN","DZ","MA","EH"].includes(code)
  )
    return "V — Middle East & North Africa";
  if (["KZ","UZ","TM","KG","TJ","MN"].includes(code)) return "VII — Central Asia";
  if (["PK","IN","BD","LK","NP","BT","MV"].includes(code)) return "VIII — South Asia";
  if (["CN","JP","KR","KP","TW","HK"].includes(code)) return "IX — East Asia";
  if (
    ["PH","VN","TH","LA","KH","MM","MY","SG","ID","BN","TL","PG","FJ","SB","VU","NC","WS","TO","AU","NZ"].includes(code)
  )
    return "X — Asia-Pacific";
  if (code === "AQ") return "XI — Antarctica";
  return "VI — Sub-Saharan Africa";
}

export default function WorldDirectoryPage() {
  const grouped = new Map<string, typeof COUNTRIES>();
  for (const c of COUNTRIES) {
    const r = regionFor(c.code);
    if (!grouped.has(r)) grouped.set(r, []);
    grouped.get(r)!.push(c);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const REGION_ORDER = [
    "I — North America & Caribbean",
    "II — South America",
    "III — Western & Northern Europe",
    "IV — Eastern Europe",
    "V — Middle East & North Africa",
    "VI — Sub-Saharan Africa",
    "VII — Central Asia",
    "VIII — South Asia",
    "IX — East Asia",
    "X — Asia-Pacific",
    "XI — Antarctica",
  ];

  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar tone="paper" middle="vol. I · § W — index by country" />

      <article className="relative mx-auto max-w-5xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="file no. W — world index" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "world" }]}
        />

        <SectionMark tone="paper">§ W — index by country</SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5.5rem)] italic leading-[0.95] tracking-[-0.01em]">
          Concerns by
          <br />
          <span className="not-italic">country</span>
          <span className="italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          What is the world afraid of, country by country? Pick a place to
          read the anonymous concerns submitted from there.
        </p>

        <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Each entry below is a country dossier. Concerns are shown in the
          order they arrived, translated into English where submitted in
          another language.
        </p>

        <div className="mt-16 space-y-16">
          {REGION_ORDER.filter((r) => grouped.has(r)).map((region) => (
            <section key={region}>
              <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                  region
                </span>
                <h2 className="font-serif text-2xl italic leading-tight text-ink sm:text-3xl">
                  {region}
                </h2>
              </div>
              <ul className="mt-6 grid gap-x-8 gap-y-3 font-sans text-base text-ink-soft sm:grid-cols-3 sm:text-lg">
                {grouped.get(region)!.map((c) => (
                  <li key={c.code} className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                      {c.code}
                    </span>
                    <Link
                      href={`/world/${c.code}`}
                      className="underline-offset-4 hover:text-ink hover:underline"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Colophon
          tone="paper"
          signature="vol. I · file W · world index — fin."
        />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "the world is listening",
          "every country · one record",
          "no names · no accounts",
          "an anonymous global record",
        ]}
      />
    </PageBg>
  );
}
