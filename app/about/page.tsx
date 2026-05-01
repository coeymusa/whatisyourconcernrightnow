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
  title: "About the record",
  description:
    "What this is, who built it, and why it exists. An anonymous global record of what humanity is afraid of — no names, no accounts, no tracking of contributors.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About the record · what is your concern?",
    description:
      "An anonymous global record of what humanity is afraid of. Read what it is, why it exists, and how it works.",
    url: `${SITE_URL}/about`,
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
      name: "About",
      item: `${SITE_URL}/about`,
    },
  ],
};

export default function AboutPage() {
  return (
    <PageBg tone="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar tone="paper" middle="vol. I · § A — about the record" />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="paper" text="file no. A — about" />

        <Breadcrumb
          tone="paper"
          crumbs={[{ label: "home", href: "/" }, { label: "about" }]}
        />

        <SectionMark tone="paper">§ A — about the record</SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(2.8rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.01em]">
          About
          <br />
          <span className="not-italic">the record</span>
          <span className="italic">.</span>
        </h1>

        <p className="mt-12 max-w-2xl border-l-2 border-blood/40 pl-6 font-serif text-2xl italic leading-snug text-ink-mid sm:text-3xl">
          <em>what is your concern?</em> is an anonymous, global record of what
          humanity is afraid of, right now.
        </p>

        <Section number="I" title="The premise">
          <p>
            People around the world post a single concern — what's keeping them
            up at night, what they fear for their family, their country, their
            species. No accounts. No usernames. No profiles. Just an age, a
            country, and a sentence. Each entry is plotted on a 3D globe of
            the Earth at the country it came from.
          </p>
          <p>
            The record is read-only after submission. You can't edit a concern.
            You can't delete it. You can respond to someone else's concern, but
            you can never speak for them or about them. It is a quiet room,
            owned by nobody, where the species can speak to itself.
          </p>
        </Section>

        <Section number="II" title="Why it exists">
          <p>
            Most public conversation in 2026 happens through identity. People
            shape what they say to fit who they are seen as. The internet has
            become a stage. We wanted to know what people would say if they
            knew nobody was looking. So we built a place where nobody is.
          </p>
          <p>
            The concerns posted here are not curated. They are not voted into
            visibility by an algorithm trained to maximize attention. They are
            simply recorded — in the order they arrived, from the place they
            arrived from — and then they stay there.
          </p>
        </Section>

        <Section number="III" title="How anonymity works">
          <p>
            We do not collect names, email addresses, IP addresses, browser
            fingerprints, or any tracking data tied to a contributor. We hash
            a one-way signal from the request to enforce simple rate limits —
            that hash is not stored against the concern itself, and we cannot
            work backward from a published concern to the person who wrote it.
          </p>
          <p>
            We hold ourselves to that standard not because the law requires it
            — privacy law in most jurisdictions would let us do much more —
            but because the entire premise of this record collapses the moment
            a contributor can be identified. If you can be identified, you
            self-edit. The record stops being a record of fear and becomes a
            record of presentation.
          </p>
        </Section>

        <Section number="IV" title="What we do with the record">
          <p>
            Nothing, in the editorial sense. The record is the artifact. We
            don't summarize it for journalists. We don't sell access to a
            sentiment dashboard. The point of the project is that the entries
            are visible to anyone, exactly as they were written, in plain
            text, forever. Anyone — a researcher, a reader, a future
            archaeologist — can read what humanity was afraid of in this
            decade.
          </p>
          <p>
            Concerns submitted in languages other than English are translated
            into English so a reader anywhere can follow what was said. Both
            the original and the translation are preserved.
          </p>
        </Section>

        <Section number="V" title="Who built it">
          <p>
            The record was built by{" "}
            <a
              href="https://coreymusa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-4 hover:underline"
            >
              Corey Musa
            </a>{" "}
            — a one-person studio, in the open. There is no company behind it.
            There is no investor, no advertiser, no AI training partnership,
            no upsell to a paid tier. The site exists because the question
            seemed worth asking and nobody else was asking it.
          </p>
          <p>
            If something here is also true for you — share this place. That
            is the only way it grows.
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
            <div className="text-ink/40">how it's built</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/methodology" className="hover:text-ink">
                methodology →
              </Link>
            </p>
          </div>
          <div>
            <div className="text-ink/40">browse</div>
            <p className="mt-2 leading-relaxed text-ink/75 normal-case tracking-normal">
              <Link href="/world" className="hover:text-ink">
                concerns by country →
              </Link>
            </p>
          </div>
        </div>

        <Colophon tone="paper" signature="vol. I · file A · about — fin." />
      </article>

      <Marquee
        tone="paper"
        phrases={[
          "an anonymous record",
          "one person · one voice · one entry",
          "no names · no accounts",
          "the world is listening",
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
