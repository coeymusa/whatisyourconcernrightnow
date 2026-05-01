import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES } from "../lib/countries";
import { fetchCountryCounts } from "../lib/supabase";
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
    "Browse anonymous concerns and live public discourse from people around the world, organized by country. What is humanity afraid of, country by country?",
  alternates: { canonical: `${SITE_URL}/world` },
  openGraph: {
    title: "Concerns by country · what is your concern?",
    description:
      "Browse anonymous concerns from people around the world, country by country.",
    url: `${SITE_URL}/world`,
    type: "website",
  },
};

export const revalidate = 300;

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

export default async function WorldDirectoryPage() {
  const counts = await fetchCountryCounts();
  const totalVoices = [...counts.values()].reduce((a, b) => a + b, 0);
  const liveCountries = counts.size;

  // Group by region. Within each region, countries with submissions float to
  // the top so the page visibly rewards the active ones.
  const grouped = new Map<string, typeof COUNTRIES>();
  for (const c of COUNTRIES) {
    const r = regionFor(c.code);
    if (!grouped.has(r)) grouped.set(r, []);
    grouped.get(r)!.push(c);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => {
      const ca = counts.get(a.code) ?? 0;
      const cb = counts.get(b.code) ?? 0;
      if (ca !== cb) return cb - ca;
      return a.name.localeCompare(b.name);
    });
  }

  // Top 6 most active countries — featured at the top of the page so a
  // first-time visitor lands on something already breathing.
  const topActive = [...COUNTRIES]
    .filter((c) => (counts.get(c.code) ?? 0) > 0)
    .sort((a, b) => (counts.get(b.code) ?? 0) - (counts.get(a.code) ?? 0))
    .slice(0, 6);

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

      <TopBar
        tone="paper"
        middle={`vol. I · § W — index by country · ${liveCountries} live`}
      />

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
          What is the world afraid of, country by country?{" "}
          {liveCountries > 0
            ? `${totalVoices.toLocaleString()} voices have been recorded so far, from ${liveCountries} countries.`
            : "Pick a country to read what's been recorded from there."}
        </p>

        <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Each entry below is a country dossier — anonymous voices submitted
          from inside the country, alongside the public discourse on the wire
          right now. Active countries are listed first.
        </p>

        {topActive.length > 0 && (
          <section className="mt-16">
            <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                most active
              </span>
              <h2 className="font-serif text-2xl italic leading-tight text-ink sm:text-3xl">
                Where the record is loudest
              </h2>
            </div>
            <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-3">
              {topActive.map((c, i) => {
                const n = counts.get(c.code) ?? 0;
                return (
                  <li key={c.code}>
                    <Link
                      href={`/world/${c.code}`}
                      className="group block border-l-2 border-blood/30 pl-4 transition hover:border-blood"
                    >
                      <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/45">
                        <span>no. {String(i + 1).padStart(2, "0")}</span>
                        <span className="text-ink/35">{c.code}</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="font-serif text-xl italic text-ink group-hover:text-blood sm:text-2xl">
                          {c.name}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-blood">
                          {n} {n === 1 ? "voice" : "voices"}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-20 space-y-16">
          {REGION_ORDER.filter((r) => grouped.has(r)).map((region) => {
            const list = grouped.get(region)!;
            const regionVoices = list.reduce(
              (a, c) => a + (counts.get(c.code) ?? 0),
              0,
            );
            return (
              <section key={region}>
                <div className="flex items-baseline gap-4 border-b border-ink/15 pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
                    region
                  </span>
                  <h2 className="font-serif text-2xl italic leading-tight text-ink sm:text-3xl">
                    {region}
                  </h2>
                  {regionVoices > 0 && (
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                      {regionVoices} {regionVoices === 1 ? "voice" : "voices"}
                    </span>
                  )}
                </div>
                <ul className="mt-6 grid gap-x-8 gap-y-3 font-sans text-base text-ink-soft sm:grid-cols-3 sm:text-lg">
                  {list.map((c) => {
                    const n = counts.get(c.code) ?? 0;
                    return (
                      <li
                        key={c.code}
                        className="flex items-baseline gap-3"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                          {c.code}
                        </span>
                        <Link
                          href={`/world/${c.code}`}
                          className={`underline-offset-4 hover:text-ink hover:underline ${
                            n === 0 ? "text-ink/55" : ""
                          }`}
                        >
                          {c.name}
                        </Link>
                        {n > 0 && (
                          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-blood">
                            {n}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
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
