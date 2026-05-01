# Twitter / X — launch thread

Tone: literary, honest, slightly unsettled. Match the site. No emojis except where surgical.

## Profile setup

- **Avatar**: open `marketing/avatar.svg` in a browser, screenshot the tab, crop to a 1024×1024 square. Or convert to PNG with any of:
  - Online: drop the SVG at https://cloudconvert.com/svg-to-png (set width = 1024)
  - macOS: `qlmanage -t -s 1024 -o . marketing/avatar.svg && mv avatar.svg.png avatar.png`
  - ImageMagick: `magick -background none -size 1024x1024 marketing/avatar.svg avatar.png`
  - VS Code: install "SVG Preview" → right-click the file → "Export PNG"
- **Display name**: `what is your concern?`
- **Handle**: whatever you have / can grab. `@whatisyourconcern` if free.
- **Bio** (160 chars max):
  > an anonymous global record of what humanity is afraid of. one voice, one entry. no accounts. whatisyourconcern.com
- **Header banner** (optional, 1500×500): a wide screenshot of the globe with a few bubbles popping. Take it on desktop, crop to a horizontal strip.

---

## The thread (5 tweets)

### T1 — hook

> i built a place where anyone, anywhere can post their biggest concern about the world — anonymously, on a draggable 3D globe.
>
> no accounts. no email. just the thing on your mind.
>
> whatisyourconcern.com

### T2 — the experience

> voices float up from countries in real time.
>
> drag the globe. click any country (yes, antarctica) to read what people there are saying — filter by topic, by age. respond if it resonates. upvote if it does.

### T3 — the why

> the only ones who hear everyone right now are the algorithms.
>
> this is an attempt at the opposite — a quiet room, owned by nobody, where the species can speak to itself.

### T4 — the build (for the curious)

> built end to end in one weekend session.
>
> next.js 16 · pure-svg orthographic globe (no three.js) · supabase · claude haiku translates non-english submissions on the way in.
>
> open source: github.com/coeymusa/What-is-your-concern

### T5 — close

> the record is empty until you speak.
>
> whatisyourconcern.com

---

## Things to do AFTER posting

1. **Pin T1** to your profile.
2. **Quote-tweet** the IIB Reddit post (if it kept rising) — natural cross-amp without looking thirsty.
3. **DM 5–10 people** with bigger followings whose work touches the themes (anonymous spaces, data viz, solidarity, internet weirdness). Keep it short: "built this — would mean a lot if you played around for a minute."
4. **Don't** reply to the thread with extra context — let the 5 tweets stand. Threads that keep going get truncated by the algorithm.

## Backup angle if T1 stalls

Re-post 24–48h later with a different hook:

> the record now has [N] voices from [N] countries. some of them will break you.
>
> whatisyourconcern.com

Pair with a screenshot of 3–4 of the most resonant entries (no faces, just the italic serif quotes).
