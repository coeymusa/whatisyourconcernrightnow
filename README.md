# whatisyourconcern.com

> A living, anonymous record of what humanity is afraid of.
> One voice, one entry. No names. No accounts. The map is the site.

Live at **[whatisyourconcern.com](https://whatisyourconcern.com)**.

You arrive into a 3D-feeling globe. Voices float up from countries in real time
— short, raw, italic — anchored to the dot they came from. Drag to rotate the
earth. Scroll to zoom. Click any country, dot, or bubble to dig in: the country
lens slides over the right side with the loudest concerns there, age
distribution, topic filters, and the option to **offer a solution** to any
concern (anonymous, attached to that entry forever).

It is a quiet room, owned by nobody, where the species can speak to itself.

---

## Stack

- **[Next.js 16](https://nextjs.org)** App Router, TypeScript, [Tailwind v4](https://tailwindcss.com)
- **[motion](https://motion.dev)** (Framer Motion v11) for everything that moves
- **[d3-geo](https://github.com/d3/d3-geo) + [topojson-client](https://github.com/topojson/topojson-client)** — sphere is hand-rendered SVG with the orthographic projection, atmospheric glow, specular highlight, day/night terminator, 220 stars, drag-to-rotate, scroll-zoom. No three.js, no canvas.
- **Fonts**: [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (display), [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (telemetry), [Geist](https://vercel.com/font/sans) (body)
- **[Supabase](https://supabase.com)** (optional) — Postgres for real persistence; in-memory fallback when env vars are unset
- **[Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)** (optional) — invisible spam shield on submissions
- **[Anthropic Claude Haiku](https://docs.anthropic.com/claude/docs)** (optional) — translates non-English submissions to English on the way in, originals preserved
- **[Vercel](https://vercel.com)** — deployment, edge runtime for the OG image

## Architecture in one diagram

```
                          ┌───────────────────────────────┐
                          │   3D Globe (orthographic)     │
                          │   ─ drag to rotate            │
   click country/dot ───▶ │   ─ wheel + buttons to zoom   │ ──▶ entry drawer
                          │   ─ ambient bubbles cycling   │     (offer a solution)
   POST your concern ───▶ │   ─ pings at your country     │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │   Country Lens (overlay)      │ ◀── click country
                          │   ─ stats + age sparkline     │
                          │   ─ topic + age filters       │
                          │   ─ chronological entries     │
                          │   ─ switcher to other lands   │
                          └───────────────────────────────┘
                                          │
                                          ▼ scroll
                          ┌───────────────────────────────┐
                          │   Explore the record          │
                          │   chips · search · sort       │
                          │   wall of concern cards       │
                          └───────────────────────────────┘
```

All state currently lives client-side (`useConcernRecord` in `app/lib/store.ts`)
seeded with a small hand-curated set. When `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are set, `/api/concerns` and `/api/solutions`
read/write Postgres instead.

## Local development

```bash
git clone https://github.com/coeymusa/whatisyourconcernrightnow.git
cd whatisyourconcernrightnow
npm install
cp .env.example .env.local   # optional — only needed for persistence/translation
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The site works fully without any environment variables — the seeds and
in-memory store are enough to demo the entire experience locally. Submissions
in this mode reset on server restart.

## Environment variables

All optional. The site degrades gracefully when any are missing.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key — used for read-only fetches |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — used by the server for writes & rate-limit RPC |
| `IP_HASH_SALT` | Salt used when hashing client IPs for rate limiting |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (renders the widget) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret (server-side verification) |
| `ANTHROPIC_API_KEY` | Translates non-English submissions to English via Claude Haiku |
| `NEXT_PUBLIC_DONATE_URL` | Stripe Payment Link / BuyMeACoffee URL — adds a small "support" link |

The Supabase schema is in [`supabase/schema.sql`](./supabase/schema.sql). Run
it once in the Supabase SQL editor.

## Project layout

```
app/
  page.tsx               · composition: Globe + Explore + Manifesto + Drawer
  layout.tsx             · fonts, metadata, OG
  opengraph-image.tsx    · edge-runtime social card
  globals.css            · theme tokens, animations
  api/
    concerns/route.ts    · GET + POST /api/concerns
    solutions/route.ts   · GET + POST /api/solutions
  components/
    Globe.tsx            · the world. orthographic projection, drag, zoom, bubbles
    QuickAdd.tsx         · age + country + textarea, ⏎ to post
    PostDialog.tsx       · modal wrapper for QuickAdd
    CountryLens.tsx      · the dossier panel
    EntryDrawer.tsx      · single-entry detail + offer a solution
    Explore.tsx          · filter + search + wall of concerns
    Manifesto.tsx        · footer
    DonateLink.tsx       · env-gated support link
    TurnstileWidget.tsx  · env-gated Cloudflare challenge
  lib/
    types.ts             · Concern, Solution, AgeBracket, ConcernCategory
    seed.ts              · 30 hand-picked seed concerns + a few solutions
    store.ts             · client hook: state + ambient stream
    countries.ts         · ISO-2 codes + population-weighted centroids
    supabase.ts          · server-only REST client (no SDK)
    translate.ts         · Claude-Haiku translation, env-gated
    rate-limit.ts        · in-memory + IP hashing
    turnstile.ts         · server-side verification
    ux.ts                · timezone-based country guess + prefs
supabase/
  schema.sql             · run once in Supabase SQL editor
```

## Design principles

- **The map is the site.** Everything else spawns from it.
- **Anonymity is non-negotiable.** No accounts, no persistent identity, IPs only used as salted hashes for rate-limiting.
- **English is the default surface.** Originals are preserved beneath the translation in muted mono — the global character is visible, every voice readable.
- **Most concerns will have zero responses.** "Be the first" is the offer.
- **No engagement metrics, no algorithm.** Newest-first by default; you can sort by most-responded but no like, follow, or upvote.
- **The aesthetic is editorial dystopia.** Cream paper, ink, blood red, amber. Instrument Serif italic.

## Deploy

Connected to Vercel. `git push` to `main` deploys a preview; promote from the
dashboard or run:

```bash
vercel --prod
```

Custom domain is set in **Vercel → probem-site → Settings → Domains**.

## License

MIT — see [LICENSE](./LICENSE) (TODO).

Contributions welcome. The whole point of this project is that it is owned by
nobody. If you have a better way to make humanity a little less alone with
itself, open a PR.
