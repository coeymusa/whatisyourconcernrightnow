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
  title: "The manifesto",
  description:
    "The manifesto for what is your concern? — a record that is anonymous, cannot be edited, cannot be censored. One voice, one entry. A quiet room, owned by nobody.",
  alternates: { canonical: `${SITE_URL}/manifesto` },
  openGraph: {
    title: "The manifesto · what is your concern?",
    description:
      "This is a record. It is anonymous. It cannot be edited. It cannot be censored. One voice, one entry.",
    url: `${SITE_URL}/manifesto`,
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
      name: "The manifesto",
      item: `${SITE_URL}/manifesto`,
    },
  ],
};

export default function ManifestoPage() {
  return (
    <PageBg tone="ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <TopBar tone="ink" middle="vol. I · § M — the manifesto" />

      <article className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16">
        <CornerMark tone="ink" text="file no. M — manifesto" />

        <Breadcrumb
          tone="ink"
          crumbs={[{ label: "home", href: "/" }, { label: "manifesto" }]}
        />

        <SectionMark tone="ink">§ M — the manifesto</SectionMark>

        <h1 className="mt-5 font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.95]">
          this is a record.
          <br />
          <span className="italic text-blood">it is anonymous.</span>
          <br />
          it cannot be edited.
          <br />
          it cannot be censored.
          <br />
          one voice, one entry.
        </h1>

        <div className="mt-16 grid gap-8 border-t border-bone/15 pt-10 sm:grid-cols-2">
          <p className="font-serif text-xl italic leading-snug text-bone/85 sm:text-2xl">
            a quiet room, owned by nobody, where the species can speak to
            itself.
          </p>
          <p className="font-serif text-xl italic leading-snug text-bone/85 sm:text-2xl">
            if something here is also true for you — share this place. that is
            the only way it grows.
          </p>
        </div>

        <Section number="I" title="The premise">
          <p>
            We are running an experiment. The hypothesis is this: if you build
            a place on the internet where nobody can be identified, where
            there is no incentive to perform, where there is no algorithm
            reordering the room — people will tell the truth about what they
            are afraid of. And the world, looking at the record, will
            recognize itself in it.
          </p>
        </Section>

        <Section number="II" title="The rules">
          <p>
            One person, one entry. No edits. No deletions. No usernames. No
            accounts. No profiles. No likes. The country and age you provide
            are the only attribution. Concerns are translated into English so
            they can be read anywhere; the original is preserved.
          </p>
          <p>
            You may respond to a concern. You may not speak for the person who
            wrote it. You may not name them or claim to know who they are.
            Responses are themselves anonymous, and they live next to the
            concern they answer, not over it.
          </p>
        </Section>

        <Section number="III" title="What this is not">
          <p>
            This is not a forum. It is not a feed. It is not a social network.
            It does not want your engagement, your retention, your return
            visit. It does not measure success in time spent on page. It is a
            record. It is something the species writes once, together, and
            leaves.
          </p>
          <p>
            We have no investors. No advertisers. No AI training partner. The
            site is funded out of pocket and supported by readers who find it
            worth keeping alive.
          </p>
        </Section>

        <Section number="IV" title="What we promise">
          <p>
            We will never publish a feature designed to identify a
            contributor. We will never sell or share the record in any form
            that breaks anonymity. We will never run advertising against the
            concerns. We will never use the record to train a commercial
            model. If we ever stop being able to keep these promises, we will
            take the site down before we break them.
          </p>
          <p className="text-bone">The record is the artifact. It is the only thing here that matters.</p>
        </Section>

        <div className="mt-20 grid gap-6 border-t border-bone/15 pt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/55 sm:grid-cols-3 sm:gap-12">
          <div>
            <div className="text-bone/40">colophon</div>
            <p className="mt-2 leading-relaxed text-bone/75 normal-case tracking-normal">
              instrument serif · jetbrains mono · geist. equal earth
              projection. built in the open.
            </p>
          </div>
          <div>
            <div className="text-bone/40">contact</div>
            <p className="mt-2 leading-relaxed text-bone/75 normal-case tracking-normal">
              this site has no inbox. it only listens.
            </p>
          </div>
          <div>
            <div className="text-bone/40">share</div>
            <p className="mt-2 leading-relaxed text-bone/75 normal-case tracking-normal">
              whatisyourconcern.com — pass it along.
            </p>
          </div>
        </div>

        <div className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
          <Link href="/" className="hover:text-bone">
            ← back to the record
          </Link>
        </div>

        <Colophon tone="ink" signature="vol. I · file M · manifesto — fin." />
      </article>

      <Marquee
        tone="ink"
        phrases={[
          "this is a record",
          "it is anonymous",
          "it cannot be edited",
          "it cannot be censored",
          "one voice · one entry",
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
      <div className="flex items-baseline gap-4 border-b border-bone/15 pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blood">
          § {number}
        </span>
        <h2 className="font-serif text-3xl italic leading-tight text-bone sm:text-4xl">
          {title}
        </h2>
      </div>
      <div className="mt-6 space-y-5 font-sans text-base leading-relaxed text-bone/80 sm:text-lg">
        {children}
      </div>
    </section>
  );
}
