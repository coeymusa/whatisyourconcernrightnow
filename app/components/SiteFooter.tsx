import Link from "next/link";

// Server-rendered footer. Gives Google crawlable internal links to every
// indexable subpage on the site. The visual styling matches the editorial
// dystopia aesthetic — quiet, hairline rules, no CTAs.
export default function SiteFooter() {
  return (
    <footer className="border-t border-bone/15 bg-ink py-12 text-bone/60 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 font-mono text-[11px] uppercase tracking-[0.22em] sm:grid-cols-4 sm:px-10">
        <div>
          <div className="text-bone/40">the record</div>
          <ul className="mt-3 space-y-2 text-bone/75 normal-case tracking-normal">
            <li>
              <Link href="/" className="hover:text-bone">
                live globe
              </Link>
            </li>
            <li>
              <Link href="/pulse" className="hover:text-bone">
                the pulse
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-bone">
                about the record
              </Link>
            </li>
            <li>
              <Link href="/manifesto" className="hover:text-bone">
                the manifesto
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="hover:text-bone">
                methodology
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-bone/40">browse by country</div>
          <ul className="mt-3 space-y-2 text-bone/75 normal-case tracking-normal">
            <li>
              <Link href="/world/US" className="hover:text-bone">
                United States
              </Link>
            </li>
            <li>
              <Link href="/world/GB" className="hover:text-bone">
                United Kingdom
              </Link>
            </li>
            <li>
              <Link href="/world/IN" className="hover:text-bone">
                India
              </Link>
            </li>
            <li>
              <Link href="/world/BR" className="hover:text-bone">
                Brazil
              </Link>
            </li>
            <li>
              <Link
                href="/world"
                className="text-bone/55 hover:text-bone"
              >
                all countries →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-bone/40">browse by topic</div>
          <ul className="mt-3 space-y-2 text-bone/75 normal-case tracking-normal">
            <li>
              <Link href="/topics/climate" className="hover:text-bone">
                climate
              </Link>
            </li>
            <li>
              <Link href="/topics/economy" className="hover:text-bone">
                economy
              </Link>
            </li>
            <li>
              <Link href="/topics/democracy" className="hover:text-bone">
                democracy
              </Link>
            </li>
            <li>
              <Link href="/topics/loneliness" className="hover:text-bone">
                loneliness
              </Link>
            </li>
            <li>
              <Link href="/topics/ai" className="hover:text-bone">
                ai
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-bone/40">colophon</div>
          <p className="mt-3 leading-relaxed text-bone/65 normal-case tracking-normal">
            an anonymous global record. one voice, one entry. no names. no
            accounts.
          </p>
          <p className="mt-3 text-bone/40 normal-case tracking-normal">
            © the record · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
