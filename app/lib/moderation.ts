// Lightweight moderation: reject submissions that smell like ads, link spam,
// or attempts to drive traffic. Conservative — if a real concern happens to
// trip a false positive, the user can rephrase.

const URL_RE = /(https?:\/\/|\bwww\.[a-z0-9-]|\b[a-z][a-z0-9-]*\.(com|net|org|io|co|app|dev|me|info|biz|gg|tv|us|uk|fr|de|ru|cn|jp|br|in|au|nl|ca|es|it|pt|pl|tr|gr|cz|ie|fi|no|se|dk|ar|cl|mx|kr|tw|sg|hk|za|eg|ng|ph|th|vn|id|my|nz|ai|xyz|to|ly|sh|so|cc|st|fm)\b)/i;

const HANDLE_RE = /(?:^|\s)@[a-z0-9_.-]{3,}/i; // @username spam

// Shadowban list — kept narrow on purpose. Only the n-word and close
// variants. Other strong words (cunt, paki, retard, chink, gook, spic, etc.)
// can appear in legitimate venting and are allowed through. We intentionally
// don't echo the matched word back anywhere — the user just sees their post
// "succeed" while it never leaves their device.
const SLUR_RE = /\bn[i1]gg(?:er|ers|a|as|az|ah|ahs|uh|uhs)?s?\b/i;

export type ModerationResult =
  | { kind: "ok" }
  // hard-block: surface a human-readable reason, the user can fix and retry.
  | { kind: "block"; reason: string }
  // shadowban: fake success, don't persist. Slurs go here so trolls don't
  // get a feedback signal that they tripped a filter.
  | { kind: "shadowban" };

// Joke-ages we shadowban silently (probably a 14-year-old being clever).
// They get a "✓ recorded" toast + see their post in localStorage; nobody
// else ever does.
const JOKE_AGES = new Set([69, 420]);

// Country codes we shadowban. Niger (NE) is overwhelmingly used as a
// vehicle for the n-word slur on this site. Real Nigerien users can pick
// Nigeria (NG) or another nearby country if they want their post to land —
// the cost of suppressing legitimate posts here is real but the troll
// signal-to-noise on NE is dire enough to justify it.
const SHADOWBAN_COUNTRIES = new Set(["NE"]);

// Server-side: run all checks, including the silent slur + joke-age shadowban.
export function moderate(
  text: string,
  ctx?: { age?: number; countryCode?: string },
): ModerationResult {
  if (URL_RE.test(text)) {
    return { kind: "block", reason: "no website links — write the thought, not a URL" };
  }
  if (HANDLE_RE.test(text)) {
    return { kind: "block", reason: "no @handles — keep it anonymous and self-contained" };
  }
  if (SLUR_RE.test(text)) {
    return { kind: "shadowban" };
  }
  if (typeof ctx?.age === "number" && JOKE_AGES.has(ctx.age)) {
    return { kind: "shadowban" };
  }
  if (ctx?.countryCode && SHADOWBAN_COUNTRIES.has(ctx.countryCode.toUpperCase())) {
    return { kind: "shadowban" };
  }
  return { kind: "ok" };
}

// Client-side: only the user-visible blocks (URL, handle). Intentionally
// does NOT check for slurs — that's a server-only check, so a troll can't
// see their post being filtered.
export function moderateClient(
  text: string,
): { ok: true } | { ok: false; reason: string } {
  if (URL_RE.test(text)) {
    return { ok: false, reason: "no website links — write the thought, not a URL" };
  }
  if (HANDLE_RE.test(text)) {
    return { ok: false, reason: "no @handles — keep it anonymous and self-contained" };
  }
  return { ok: true };
}
