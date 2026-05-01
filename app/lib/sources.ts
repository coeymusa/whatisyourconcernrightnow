// Public-discourse signal aggregation. Pulls real headlines/posts from
// no-auth, public sources so country and topic pages can show what the world
// is actually saying — separate from anonymous user submissions.
//
// Sources used:
//   • GDELT 2.0 DOC API  — global news index, free, no auth
//   • Reddit JSON         — public subreddit hot posts, no auth
//   • Hacker News Algolia — full-text search across HN, no auth
//
// All fetchers swallow errors and return [] so a page never blows up because
// an external service is slow or down.

export type PublicSignalSource = "gdelt" | "reddit" | "hn" | "gnews";

export type PublicSignal = {
  source: PublicSignalSource;
  sourceLabel: string; // human-readable, e.g. "Reuters" or "r/india"
  title: string;
  url: string;
  ts: number; // unix ms
  excerpt?: string;
};

const UA = "whatisyourconcern.com (+https://whatisyourconcern.com/about)";

// ---------- GDELT ----------------------------------------------------------
//
// GDELT asks for one query every 5 seconds. We serialize calls within a
// single process via a chained promise so concurrent page renders don't
// burst-hit the API. Across multiple Next.js server instances this isn't
// strictly enforced, but Vercel's caching + Next's fetch revalidate mean we
// only actually hit GDELT on cache misses.
const GDELT_MIN_GAP_MS = 5200;
let gdeltChain: Promise<void> = Promise.resolve();
let gdeltLastCall = 0;

function gdeltSlot(): Promise<void> {
  const next = gdeltChain.then(async () => {
    const wait = Math.max(0, gdeltLastCall + GDELT_MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    gdeltLastCall = Date.now();
  });
  gdeltChain = next.catch(() => undefined);
  return next;
}


// GDELT's seendate format is YYYYMMDDTHHMMSSZ; convert to unix ms.
function parseGdeltDate(s: string | undefined): number {
  if (!s) return Date.now();
  // 20260501T143000Z → 2026-05-01T14:30:00Z
  const m = s.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/,
  );
  if (!m) return Date.now();
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function fetchGdelt(
  query: string,
  limit = 8,
): Promise<PublicSignal[]> {
  // GDELT requires sourcelang:english as a query operator (not a separate
  // parameter). Forcing English keeps the wire readable on an English-first
  // site. Translation of foreign-language press is out of scope here.
  const fullQuery = `${query} sourcelang:english`;
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
      fullQuery,
    )}` +
    `&mode=ArtList&maxrecords=${limit}&format=json&sort=DateDesc`;
  try {
    await gdeltSlot();
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800, tags: [`gdelt:${query}`] },
    });
    if (!r.ok) return [];
    // GDELT returns plaintext rate-limit messages on 200 sometimes, so
    // peek at the body before parsing.
    const text = await r.text();
    if (!text.trim().startsWith("{")) return [];
    const data = JSON.parse(text) as {
      articles?: Array<{
        title?: string;
        url?: string;
        seendate?: string;
        domain?: string;
      }>;
    };
    const arts = data.articles ?? [];
    return arts
      .filter((a) => a.title && a.url && isLikelyEnglish(a.title))
      .slice(0, limit)
      .map<PublicSignal>((a) => ({
        source: "gdelt",
        sourceLabel: a.domain ?? domainOf(a.url!),
        title: cleanTitle(a.title!),
        url: a.url!,
        ts: parseGdeltDate(a.seendate),
      }));
  } catch {
    return [];
  }
}

// ---------- Reddit ---------------------------------------------------------

type RedditPost = {
  data: {
    title: string;
    permalink: string;
    selftext?: string;
    created_utc: number;
    score: number;
    stickied?: boolean;
    over_18?: boolean;
  };
};

export async function fetchRedditHot(
  subreddit: string,
  limit = 8,
): Promise<PublicSignal[]> {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit + 5}&raw_json=1`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800, tags: [`reddit:${subreddit}`] },
    });
    if (!r.ok) return [];
    const data = (await r.json()) as {
      data?: { children?: RedditPost[] };
    };
    const posts = data.data?.children ?? [];
    return posts
      .filter(
        (p) =>
          !p.data.stickied &&
          !p.data.over_18 &&
          p.data.score >= 5 &&
          p.data.title.length > 0 &&
          isLikelyEnglish(p.data.title),
      )
      .slice(0, limit)
      .map<PublicSignal>((p) => ({
        source: "reddit",
        sourceLabel: `r/${subreddit}`,
        title: cleanTitle(p.data.title),
        url: `https://reddit.com${p.data.permalink}`,
        ts: p.data.created_utc * 1000,
        excerpt: p.data.selftext?.slice(0, 240) || undefined,
      }));
  } catch {
    return [];
  }
}

// ---------- Hacker News (Algolia search) -----------------------------------

export async function fetchHN(
  query: string,
  limit = 8,
): Promise<PublicSignal[]> {
  const url =
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}` +
    `&tags=story&hitsPerPage=${limit}&numericFilters=points>40`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800, tags: [`hn:${query}`] },
    });
    if (!r.ok) return [];
    const data = (await r.json()) as {
      hits?: Array<{
        title?: string;
        url?: string;
        objectID?: string;
        created_at_i?: number;
        points?: number;
      }>;
    };
    const hits = data.hits ?? [];
    return hits
      .filter((h) => h.title && (h.url || h.objectID))
      .slice(0, limit)
      .map<PublicSignal>((h) => ({
        source: "hn",
        sourceLabel: "Hacker News",
        title: cleanTitle(h.title!),
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        ts: (h.created_at_i ?? Math.floor(Date.now() / 1000)) * 1000,
      }));
  } catch {
    return [];
  }
}

// ---------- Google News RSS ------------------------------------------------
//
// RSS feed of Google News search results. No auth, no rate limit hassle, and
// reliable from Vercel's IP pool — unlike Reddit's public JSON endpoint.

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function tag(item: string, name: string): string | undefined {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]).trim() : undefined;
}

// Strip the trailing " - Source Name" Google News appends to titles when no
// CDATA wraps it. We pull the source separately from the <source> tag.
function stripSourceSuffix(title: string, source: string | undefined): string {
  if (source && title.endsWith(` - ${source}`)) {
    return title.slice(0, -(source.length + 3));
  }
  return title;
}

export async function fetchGoogleNews(
  query: string,
  limit = 8,
): Promise<PublicSignal[]> {
  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` +
    `&hl=en-US&gl=US&ceid=US:en`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800, tags: [`gnews:${query}`] },
    });
    if (!r.ok) return [];
    const xml = await r.text();
    if (!xml.includes("<item>")) return [];
    const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const out: PublicSignal[] = [];
    for (const m of matches.slice(0, limit * 2)) {
      const item = m[1];
      const titleRaw = tag(item, "title");
      const link = tag(item, "link");
      const pubDate = tag(item, "pubDate");
      const source = tag(item, "source");
      if (!titleRaw || !link) continue;
      const title = stripSourceSuffix(titleRaw, source);
      if (!isLikelyEnglish(title)) continue;
      const ts = pubDate ? Date.parse(pubDate) : Date.now();
      out.push({
        source: "gnews",
        sourceLabel: source ?? "google news",
        title: cleanTitle(title),
        url: link,
        ts: Number.isFinite(ts) ? ts : Date.now(),
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

// ---------- helpers --------------------------------------------------------

function cleanTitle(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

// Three-pass English detection.
//   1. Drop non-Latin scripts (Cyrillic, CJK, Arabic, Greek, Devanagari, ...)
//   2. Drop anything with characters specific to Latin-but-not-English alphabets
//      (ñ, ç, ã, ß, etc. — English borrowed words rarely appear in headlines).
//   3. Drop anything matching a non-English function-word pattern (French
//      "c'est", German "der/die/das", Spanish "los/del", Swedish "och/inte",
//      Italian "il/della", Portuguese "não/que").
// What gets through: clean ASCII Latin headlines that don't trip any
// non-English signal. Some non-English titles will still slip through,
// but the false-positive rate is acceptable.
const NON_LATIN_LANG_CHARS = /[äöüßåéèêëîïôûùçñãõœæšřčłžęóąńśśźż]/i;

const NON_ENGLISH_PATTERNS: RegExp[] = [
  // French
  /\bc'est\b/i,
  /\bqu'(?:a|e|i|o|u)/i,
  /\bj'(?:a|e|i|o|u)/i,
  /\bn'(?:e|a|y)/i,
  /\bd'(?:a|e|i|o|u)/i,
  /\bl'(?:a|e|i|o|u)/i,
  /\best-ce\b/i,
  /\bque\b/i,
  /\bdes\b/i,
  /\bune\b/i,
  /\bavec\b/i,
  /\bpour\b/i,
  /\bdans\b/i,
  // German
  /\bder\b/i,
  /\bdie\b/i,
  /\bdas\b/i,
  /\bund\b/i,
  /\bist\b/i,
  /\bnicht\b/i,
  /\bauch\b/i,
  /\bauf\b/i,
  /\bsich\b/i,
  /\bnach\b/i,
  // Spanish / Portuguese
  /\bdel\b/i,
  /\blos\b/i,
  /\blas\b/i,
  /\bcomo\b/i,
  /\bpara\b/i,
  /\bsobre\b/i,
  /\bnão\b/i,
  // Swedish / Norwegian / Danish
  /\boch\b/i,
  /\binte\b/i,
  /\batt\b/i,
  /\bmen\b/i,
  /\bjag\b/i,
  /\bsom\b/i,
  // Italian
  /\bgli\b/i,
  /\bdella\b/i,
  /\bsono\b/i,
];

function isLikelyEnglish(t: string): boolean {
  if (t.length < 6) return false;

  let nonLatin = 0;
  for (const ch of t) {
    const code = ch.codePointAt(0) ?? 0;
    if (code > 0x024f && !/\s/.test(ch)) nonLatin++;
  }
  if (nonLatin / t.length > 0.2) return false;

  if (NON_LATIN_LANG_CHARS.test(t)) return false;

  if (NON_ENGLISH_PATTERNS.some((r) => r.test(t))) return false;

  return true;
}

// Interleave multiple result lists round-robin so the final feed shows a mix
// of sources at the top instead of one source dominating.
export function interleave<T>(...lists: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const l of lists) {
      if (l[i] !== undefined) out.push(l[i]);
    }
  }
  return out;
}

// Dedupe by URL and title-prefix — syndicated copies of the same article
// often have different URLs but identical headlines.
export function dedupe(items: PublicSignal[]): PublicSignal[] {
  const seenUrl = new Set<string>();
  const seenTitle = new Set<string>();
  const out: PublicSignal[] = [];
  for (const it of items) {
    const titleKey = it.title.toLowerCase().replace(/\s+/g, " ").slice(0, 60);
    if (seenUrl.has(it.url) || seenTitle.has(titleKey)) continue;
    seenUrl.add(it.url);
    seenTitle.add(titleKey);
    out.push(it);
  }
  return out;
}
