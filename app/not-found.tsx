import Link from "next/link";
import {
  Breadcrumb,
  Colophon,
  CornerMark,
  Marquee,
  PageBg,
  SectionMark,
  TopBar,
} from "./components/editorial";

export const metadata = {
  title: "Page not found",
  description:
    "The record does not contain this page. Try the homepage, the pulse, or stumble onto a random voice.",
};

export default function NotFound() {
  return (
    <PageBg tone="paper">
      <TopBar tone="paper" middle="vol. I · § 404 — page not found" />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="file no. 404 — not found" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "404" }]}
        />

        <SectionMark tone="paper">§ 404 — page not found</SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5.8rem)] italic leading-[0.95] tracking-[-0.01em]">
          The record
          <br />
          <span className="not-italic">does not</span>
          <br />
          <span className="text-blood">contain this page</span>
          <span className="italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-xl italic leading-snug text-ink-mid sm:text-2xl">
          The URL you followed leads nowhere on this site. It may have been a
          dispatch that was hidden, a country code that doesn't exist, or a
          link that was never written.
        </p>

        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          Three places to go from here, in roughly increasing order of
          serendipity:
        </p>

        <ul className="mt-8 space-y-6">
          <li>
            <Link
              href="/"
              className="group block border-l-2 border-blood/30 pl-5 transition hover:border-blood sm:pl-7"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/45 group-hover:text-ink">
                no. 01
              </div>
              <div className="mt-1 font-serif text-2xl italic text-ink group-hover:text-blood sm:text-3xl">
                Back to the globe →
              </div>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft sm:text-base">
                The homepage. The 3D record of every voice, in real time.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/pulse"
              className="group block border-l-2 border-blood/30 pl-5 transition hover:border-blood sm:pl-7"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/45 group-hover:text-ink">
                no. 02
              </div>
              <div className="mt-1 font-serif text-2xl italic text-ink group-hover:text-blood sm:text-3xl">
                Read the pulse →
              </div>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft sm:text-base">
                The week's editorial summary — what the world is afraid of,
                this week.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/random"
              className="group block border-l-2 border-blood/30 pl-5 transition hover:border-blood sm:pl-7"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/45 group-hover:text-ink">
                no. 03
              </div>
              <div className="mt-1 font-serif text-2xl italic text-ink group-hover:text-blood sm:text-3xl">
                Stumble on a random voice →
              </div>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft sm:text-base">
                A coin flip into the record. Land somewhere unexpected.
              </p>
            </Link>
          </li>
        </ul>

        <Colophon tone="paper" signature="vol. I · file 404 — fin." />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "the record continues",
          "no names · no accounts",
          "anonymous · permanent · global",
          "what is your concern",
        ]}
      />
    </PageBg>
  );
}
