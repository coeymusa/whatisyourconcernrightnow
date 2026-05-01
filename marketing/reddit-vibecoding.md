# Reddit — r/vibecoding

## Title (pick one)

**A.** vibe-coded an anonymous global concern map onto a draggable 3D globe — open source

**B.** I built a place where anyone, anywhere, can post what scares them — entirely by talking to Claude

**C.** ~10 hours of vibe-coding → a globe of human concerns. lessons + repo inside

(A is most concrete; that one tends to perform on r/vibecoding.)

**Submit type:** link post → `https://whatisyourconcern.com`

---

## Body / OP comment

> Spent a weekend vibe-coding **whatisyourconcern.com** — an anonymous global record of what people are afraid of, mapped onto a 3D draggable globe. Voices float up from countries in real time. Click any country (yes, including Antarctica) → dossier slides in with what people there are saying, age distribution, topic + age filters, and a one-click "post about [country]" CTA. No accounts, no email, just type and post.
>
> **What's interesting from a vibe-coding perspective:**
>
> The whole thing was built conversationally. I never wrote a line of CSS. I described the *feeling* I wanted — "editorial dystopia, newspaper-of-the-unconscious, voyeuristic curiosity" — and iterated. The aesthetic stuck. When I said "the map should feel like a globe, drag to rotate, beautiful," the model rewrote the projection from `geoEqualEarth` to `geoOrthographic`, added atmospheric glow + 220 stars + day/night terminator + drag handlers, all in pure SVG (no three.js).
>
> Things that worked great:
> - **Trusting the iteration loop.** I changed direction maybe 8 times. Each pivot was 2–3 messages and a deploy. Tried a persistent input bar, then moved it to a modal. Tried inverted dark cards in the explore section, hated them, reverted to bone-on-cream in one message.
> - **Browser verification in the loop.** The AI screenshots/inspects what it built and finds its own bugs. Caught a `setPointerCapture` bug that was suppressing country clicks — would've taken me an hour.
> - **Letting the model own the boring stuff.** Supabase schema, env-gated translation via Claude Haiku, Cloudflare Turnstile scaffolding, OG image, favicon — all generated, all working, none of it interesting to write.
>
> Things that needed me:
> - **Aesthetic taste.** First favicon (red italic "?") looked terrible. Asked for a redesign. Second one (red dot + faint planet ring) is great. The model needs you to push back.
> - **Cutting features.** The first version had wire feed + response feed + concern index + generational divide sections. I killed all of them and replaced with a single Explore section. The AI doesn't know when to stop.
> - **Knowing what's "fake."** It happily added a synthetic ambient stream that *invented* concerns popping up. Looks alive. Lies. Killed it.
>
> **Stack:** Next.js 16 + Tailwind v4 + d3-geo + motion. Supabase for persistence (optional — falls back to in-memory). Claude Haiku translates non-English submissions. Cloudflare Turnstile for spam. Vercel.
>
> **Open source:** [github.com/coeymusa/What-is-your-concern](https://github.com/coeymusa/What-is-your-concern)
>
> Curious what people on this sub think. Especially: how do you decide *when* to push back vs. let the model run?

---

## Mod-friendly behaviour

- Reply to comments for the first hour. Engagement gates this sub.
- If asked "which AI?" → Claude Code (don't pitch other tools, looks promotional).
- If asked "how long?" → be honest. ~10 hours over a weekend, a lot of iteration.
- Don't link to Twitter/IG. r/vibecoding gets snarky about cross-promo.

## Backup framing if the first post stalls

Re-title with the lessons angle instead of the project angle:

> 8 direction-changes, 3 hours of debugging, ~10 hours total: what vibe-coding actually felt like for one project

…and lead the body with the lessons section, then the project link at the end.

## Best time to post

- Tuesday / Wednesday / Thursday, 10 AM US Eastern is sweet spot for r/vibecoding.
- The sub skews late-night-builders too — secondary slot is 9–11 PM US Pacific.
