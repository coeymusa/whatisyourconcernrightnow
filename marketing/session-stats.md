# Session stats

> One vibe-coding session. Idea → live SaaS-grade site with database,
> moderation, voting, i18n, OG images, social drafts, and a domain.

## Time

- **First git commit:** `2026-05-01 00:01:44 +0100`
- **Last git commit:** `2026-05-01 02:12:22 +0100`
- **Git-tracked wall clock: 2 h 10 min 38 s**
- (~30–60 min of scaffolding + discussion before `git init`, total ≈ 3 hours)

## Output

| | Count |
| --- | --- |
| Git commits | **23** |
| Vercel deploys | **41** |
| Files (app/) | 36 |
| `.tsx` | 22 |
| `.ts` | 13 |
| `.sql` | 3 |
| `.md` (docs / drafts) | 3 |
| **Total lines (TS/TSX/SQL/CSS/MD)** | **6,309** |

## Direction pivots in one session

1. Editorial newspaper aesthetic
2. → Globe-first / "the map IS the site"
3. Flat Equal-Earth → orthographic 3D draggable globe
4. Persistent input ribbon → modal post button
5. Five separate "deeper read" sections → single Explore section
6. Cream-on-cream cards → ink → bone cards (final)
7. 70 countries → 165 countries (every country in world-atlas, including Antarctica)
8. Client-side seeds → Supabase-backed seeds → no seeds at all (fresh launch)
9. Read-only → upvotes / "this resonates" + URL/handle moderation

## Features shipped

- 3D draggable orthographic globe with atmospheric glow, scan line, 220 stars, sphere shading, day/night terminator, scroll-zoom, click-to-fly
- 165-country click coverage (incl. Antarctica) with auto-pan to selection
- Country dossier panel: voices count, age sparkline, topic + age filter chips, country switcher
- Bubble layer that re-projects per frame so voices follow the spin
- Anonymous submit / response drawer
- Post-for-country flow: click a country → "+ post about [country]" with the country pre-filled
- Upvotes ("this resonates"), per-IP rate limit (60/h)
- URL + @handle moderation, server + client side
- English-by-default with translated originals shown beneath; server-side translation via Claude Haiku (env-gated)
- Live polling every 20s — other people's posts surface without refresh
- Empty-state cue when zero entries
- OG image, Apple touch icon, favicon, OG cards
- Cloudflare Turnstile spam shield (env-gated)
- Supabase persistence with rate-limit RPC + ip-hash salting
- Donate link (env-gated) for Stripe Payment Link / BuyMeACoffee
- README, Insta launch drafts, Reddit launch drafts (IIB + vibecoding)
- 23 commits pushed to GitHub, all 41 deploys to Vercel
- Custom domain wired (whatisyourconcern.com, SSL verified)

## Tech stack

Next.js 16 · Tailwind v4 · TypeScript · motion · d3-geo · topojson-client · Supabase · Cloudflare Turnstile · Anthropic Claude Haiku (translation)

## Tokens (rough)

I don't have a precise meter, but:
- Several **million** input tokens (most of which were prompt-cached)
- A few **hundred thousand** output tokens
- The cache is the only reason this is plausible at this length and price

## How

Claude Code, Sonnet/Opus tier, with the browser-in-Chrome MCP server enabled
so the agent could verify what it was building (and catch its own bugs — it
caught a `setPointerCapture` issue that suppressed country clicks).

Most of the time was spent **iterating taste**, not waiting for code:
- "the cards are too washy" → restyle
- "this is fake data" → rip it out
- "the dots aren't on the front of the globe" → real spherical visibility test
- "click should also work on Antarctica" → expand the country mapping
