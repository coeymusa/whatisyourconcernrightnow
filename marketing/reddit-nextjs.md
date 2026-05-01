# Reddit — r/nextjs

## Title

**Pure-SVG orthographic globe in Next.js 16: drag-to-rotate, scroll-zoom, no three.js, ~5kb of map code**

(Backups if A flops:)
- "I rebuilt a 'globe.gl-style' draggable earth in pure SVG and Next.js — would I do it again? sometimes"
- "Why I shipped a 3D globe in pure SVG instead of three.js (Next.js + d3-geo)"

**Submit type:** link post → `https://whatisyourconcern.com`

---

## Body / OP comment (post immediately after the URL goes live)

```
Built whatisyourconcern.com — an anonymous global concern map — and the
core viz is a draggable, zoomable 3D-feeling globe rendered as pure SVG
via d3-geo's orthographic projection. No three.js. No canvas. No WebGL.
Just SVG paths, React state, and ~250 lines of TSX.

Sharing because every "draggable globe" tutorial I could find reaches
straight for three.js or globe.gl, and I wanted to know if you actually
need to. Spoiler: no, but with caveats.
```

### How it works

The "3D" is a `geoOrthographic` projection from `d3-geo` — a real spherical
projection, not a 2D fake. `clipAngle(90)` makes it cull the back hemisphere.

```ts
const projection = useMemo(
  () =>
    geoOrthographic()
      .scale(globeRadius)
      .translate([cx, cy])
      .rotate([lambda, phi])
      .clipAngle(90),
  [globeRadius, cx, cy, lambda, phi],
);

const pathGen = geoPath(projection);
```

Drag-to-rotate is just `setState` on `[lambda, phi]` from pointer deltas:

```ts
const onPointerMove = (e) => {
  if (!dragRef.current) return;
  const dx = e.clientX - dragRef.current.x;
  const dy = e.clientY - dragRef.current.y;
  const k = SENSITIVITY / Math.max(0.5, scaleFactor);
  // RAF-throttled — coalesces multiple events per frame
  queueRotation([
    dragRef.current.rot[0] + dx * k,
    Math.max(-88, Math.min(88, dragRef.current.rot[1] - dy * k)),
  ]);
};
```

Each frame, every `<path>` in the map regenerates via `pathGen(feature)`.
React reconciles, browser repaints. ~60fps even on a 4-year-old laptop
because SVG paths are batched into a single layer.

### The trick that almost everyone misses

`geoOrthographic([lon, lat])` returns finite coordinates **even for points
on the back hemisphere** — they overlap with their antipode on the front.
`clipAngle(90)` clips paths via `geoPath`, but raw point projection
ignores it. So if you naively plot dots, a dot for Japan ends up
rendered "inside" Argentina when Japan is on the far side of the globe.

You need a real spherical visibility test:

```ts
function isFrontHemisphere(projection, lon, lat) {
  const rot = projection.rotate(); // [lambda, phi, gamma]
  const lambda0 = -rot[0];
  const phi0 = -rot[1];
  const cosC =
    Math.sin(phi0 * D) * Math.sin(lat * D) +
    Math.cos(phi0 * D) * Math.cos(lat * D) * Math.cos((lon - lambda0) * D);
  return cosC > 0.02; // strict > 0 has limb-glitch
}
```

This bit me in production for a day before I caught it.

### Trade-off study (honest)

| | Pure SVG + d3-geo | three.js / globe.gl |
|---|---|---|
| Bundle size for the globe code | **~5 kb** + d3-geo (~30 kb) + topojson-client (~10 kb) | three core (~150 kb gz) + globe.gl (~50 kb) + textures |
| First paint | Server-renderable, no canvas init | Client-only, canvas spin-up |
| Frame rate | Solid at ~250 dots, lags past ~1500 | Fine at 100k+ dots with instancing |
| Atmosphere / glow / day-night | Pure SVG `<defs>` (radial gradients) | Real shaders if you want them |
| Textures (earth surface) | None — country fills only | Trivial |
| Accessibility / SEO | DOM is real, screen readers see country names | Canvas is opaque |
| Debugging | Browser inspector shows every path | RenderDoc / spector.js territory |
| Time to "drag rotates the planet" from scratch | A weekend | A week + asset prep |

### When I'd reach for three.js instead

- 1k+ moving points
- Real earth textures
- Real atmospheric scattering (the SVG one is faked with a radial gradient)
- Stars rendered as a starfield with parallax
- Anything where the user expects a "real" 3D experience and not an editorial map

### When SVG wins

- Static-ish data points (concerns, sales, store locations, etc.)
- You care about bundle size or initial paint
- You want to server-render the globe at request time (Next.js SSR)
- Your aesthetic is "editorial", "newspaper", or "data dashboard" rather than "video game"
- You want the DOM to be the source of truth (a11y, hover states from CSS, etc.)

### Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · `d3-geo` · `topojson-client` · `motion` for non-globe animations · Vercel.

Live: https://whatisyourconcern.com
Code: https://github.com/coeymusa/What-is-your-concern (the globe is in `app/components/Globe.tsx`)

Curious what the sub thinks — anyone else building 3D-feeling viz in pure SVG instead of WebGL? Where's your line?

---

## Mod-friendly behaviour

- Reply to questions in the first hour. r/nextjs upvotes posts where OP engages with technical follow-ups.
- If someone asks "why not three.js" — re-ground in the trade-off table, don't pitch SVG as universally better.
- Drop more code snippets in comments when asked. The repo link is OP's friend.

## Best time

Tuesday or Wednesday morning, **9–11 AM US Eastern**. r/nextjs traffic peaks during the US workday; weekend posts get buried.
