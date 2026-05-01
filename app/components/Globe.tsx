"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  geoOrthographic,
  geoPath,
  geoGraticule10,
  type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { motion, AnimatePresence } from "motion/react";
import type { Concern, ConcernCategory, Solution } from "../lib/types";
import { COUNTRIES, findByM49, findCountry } from "../lib/countries";
import CountryLens from "./CountryLens";
import DonateLink from "./DonateLink";
import PostDialog from "./PostDialog";
import ShareLinks from "./ShareLinks";

const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country lookup is now driven by lib/countries.ts via findByM49 — supports
// every country in the world-atlas topojson, including Antarctica.

type Bubble = {
  id: string;
  concern: Concern;
  bornAt: number;
  ttl: number;
  flavor: "ambient" | "yours";
};

type Props = {
  concerns: Concern[];
  solutions: Solution[];
  totalCountries: number;
  responses: number;
  loaded?: boolean;
  // ambient rotation speed in degrees / second. 0 (or undefined) disables.
  // demo uses ~6 deg/s; main site uses ~2.5 deg/s for a barely-perceptible
  // drift that signals "live" without distracting from posts being read.
  autoRotate?: number;
  // ms before the first bubble pops. demo bumps this to ~5s so the opening
  // shot is a calm, empty globe.
  bubbleDelay?: number;
  onSubmit: (input: {
    age: number;
    countryCode: string;
    text: string;
    category: ConcernCategory;
  }) => void;
  onOpen: (c: Concern) => void;
};

const MIN_BUBBLE_GAP = 200;
const ROTATE_SENSITIVITY = 0.32;
const MIN_SCALE_FACTOR = 0.78;
const MAX_SCALE_FACTOR = 2.4;
const INITIAL_ROTATION: [number, number] = [-15, -18];

// deterministic pseudo-random for stars
function det(i: number): number {
  let x = (i * 2654435761) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 0xffffffff;
}

function distance(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// True if (lon, lat) is on the front hemisphere of an orthographic projection.
// d3-geo's `projection.rotate()` returns [lambda, phi, gamma] — the geographic
// projection center is at (-lambda, -phi). A point is visible iff the great-
// circle angular distance to that center is < 90°.
function isFrontHemisphere(
  projection: GeoProjection,
  lon: number,
  lat: number,
): boolean {
  const rot = projection.rotate();
  const lambda0 = -rot[0];
  const phi0 = -rot[1];
  const toRad = Math.PI / 180;
  const cosC =
    Math.sin(phi0 * toRad) * Math.sin(lat * toRad) +
    Math.cos(phi0 * toRad) *
      Math.cos(lat * toRad) *
      Math.cos((lon - lambda0) * toRad);
  // strict > 0 hides exactly-on-the-limb points, which look glitchy
  return cosC > 0.02;
}

// project lon/lat through current projection — null if on far hemisphere
function projectIfVisible(
  projection: GeoProjection,
  lon: number,
  lat: number,
): [number, number] | null {
  if (!isFrontHemisphere(projection, lon, lat)) return null;
  const p = projection([lon, lat]);
  if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
  return [p[0], p[1]];
}

export default function Globe({
  concerns,
  solutions,
  totalCountries,
  responses,
  loaded = false,
  autoRotate = 0,
  bubbleDelay = 800,
  onSubmit,
  onOpen,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 720 });
  const [topo, setTopo] = useState<FeatureCollection<Geometry> | null>(null);
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [pings, setPings] = useState<{ id: string; x: number; y: number }[]>([]);
  const [postOpen, setPostOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [postInitialCountry, setPostInitialCountry] = useState<string | undefined>(undefined);

  const openPost = useCallback((country?: string) => {
    setPostInitialCountry(country);
    setPostOpen(true);
  }, []);

  // sphere camera state
  const [rotation, setRotation] = useState<[number, number]>(INITIAL_ROTATION);
  const [scaleFactor, setScaleFactor] = useState(1);
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);

  // RAF-throttled rotation: coalesce multiple pointermove events per frame
  // into a single setRotation, so even rapid drags don't hammer React with
  // 60+ re-renders per second on slower devices.
  const rafRef = useRef<number | null>(null);
  const pendingRotRef = useRef<[number, number] | null>(null);
  const flushRotation = useCallback(() => {
    rafRef.current = null;
    if (pendingRotRef.current) {
      setRotation(pendingRotRef.current);
      pendingRotRef.current = null;
    }
  }, []);
  const queueRotation = useCallback(
    (next: [number, number]) => {
      pendingRotRef.current = next;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushRotation);
      }
    },
    [flushRotation],
  );

  const selectCountry = useCallback((code: string | null) => {
    setSelectedCountry(code);
  }, []);

  // resize observer
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      if (w > 0 && h > 0) setSize({ w, h });
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // topology
  useEffect(() => {
    let cancelled = false;
    fetch(TOPOJSON_URL)
      .then((r) => r.json())
      .then((world: Topology) => {
        if (cancelled) return;
        const collection = feature(
          world,
          world.objects.countries as GeometryCollection,
        ) as unknown as FeatureCollection<Geometry>;
        setTopo(collection);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // globe radius and center
  const globeRadius = useMemo(() => {
    const base = Math.min(size.w, size.h) * 0.44;
    return Math.max(160, base * scaleFactor);
  }, [size.w, size.h, scaleFactor]);

  const center = useMemo<[number, number]>(
    () => [size.w / 2, size.h / 2 + 8],
    [size.w, size.h],
  );

  // projection (orthographic = sphere)
  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(globeRadius)
        .translate(center)
        .rotate([rotation[0], rotation[1]])
        .clipAngle(90),
    [globeRadius, center, rotation],
  );

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  // stars layer (computed once, deterministic)
  const stars = useMemo(() => {
    const arr: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < 220; i++) {
      arr.push({
        x: det(i + 1100) * 100,
        y: det(i + 2200) * 100,
        r: 0.4 + det(i + 3300) * 1.0,
        o: 0.25 + det(i + 4400) * 0.5,
      });
    }
    return arr;
  }, []);

  // ----- Bubble cycling --------------------------------------------------
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const concernsRef = useRef<Concern[]>(concerns);
  useEffect(() => {
    concernsRef.current = concerns;
  }, [concerns]);

  // keep latest projection in a ref so the cycler effect (below) doesn't
  // need projection in its dep array — with autoRotate enabled, projection
  // changes every frame, which would otherwise restart the timer 60×/sec
  // and prevent any tick from ever firing
  const projectionRef = useRef<GeoProjection>(projection);
  useEffect(() => {
    projectionRef.current = projection;
  });

  // remove bubbles whose country has rotated to the back hemisphere
  useEffect(() => {
    setBubbles((prev) => {
      const next = prev.filter((b) => {
        const country = findCountry(b.concern.countryCode);
        if (!country) return false;
        return isFrontHemisphere(projection, country.lon, country.lat);
      });
      // avoid causing a re-render when nothing actually changed
      return next.length === prev.length ? prev : next;
    });
  }, [projection]);

  // dismiss a bubble explicitly (× button or tap-outside on mobile)
  const dismissBubble = useCallback((id: string) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isSmall = size.w < 700;
    // 1 bubble on mobile so it doesn't dominate the screen, 3 on desktop
    const maxBubbles = isSmall ? 1 : 3;

    let nextTimer: number | undefined;

    function tick() {
      if (cancelled) return;
      const proj = projectionRef.current;
      const now = Date.now();
      setBubbles((prev) => {
        const live = prev.filter((b) => now - b.bornAt < b.ttl);
        if (live.length >= maxBubbles) return live;

        const all = concernsRef.current;
        if (all.length === 0) return live;

        for (let attempt = 0; attempt < 18; attempt++) {
          const c = all[Math.floor(Math.random() * all.length)];
          if (live.some((b) => b.concern.id === c.id)) continue;
          const country = findCountry(c.countryCode);
          if (!country) continue;
          const p = projectIfVisible(proj, country.lon, country.lat);
          if (!p) continue;
          const [x, y] = p;
          if (
            x < 130 ||
            x > size.w - 130 ||
            y < 110 ||
            y > size.h - 60
          )
            continue;
          // ensure spacing from existing bubbles (re-project them)
          const conflict = live.some((b) => {
            const bc = findCountry(b.concern.countryCode);
            if (!bc) return false;
            const bp = proj([bc.lon, bc.lat]);
            if (!bp) return false;
            return distance(bp[0], bp[1], x, y) < MIN_BUBBLE_GAP;
          });
          if (conflict) continue;
          return [
            ...live,
            {
              id: `bubble-${now}-${attempt}`,
              concern: c,
              bornAt: now,
              // mobile gets a shorter dwell so a missed one disappears faster
              ttl: isSmall ? 5000 + Math.random() * 1500 : 6500 + Math.random() * 2500,
              flavor: "ambient",
            },
          ];
        }
        return live;
      });

      // mobile spawns slower so users have time to look at the globe
      const nextDelay = isSmall
        ? 4000 + Math.random() * 3000
        : 1500 + Math.random() * 1500;
      nextTimer = window.setTimeout(tick, nextDelay);
    }

    const t0 = window.setTimeout(tick, bubbleDelay);
    return () => {
      cancelled = true;
      window.clearTimeout(t0);
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
    };
  }, [size.w, size.h, bubbleDelay]);

  // ----- Pointer interactions: drag (1 finger) + pinch (2 fingers) ------
  const dragRef = useRef<{ x: number; y: number; rot: [number, number] } | null>(null);
  // active pointers — for pinch detection we need to know about all of them
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  // pinch state — initial pointer distance + the scale at pinch-start
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 2) {
        // second finger landed — flip into pinch mode, abandon the drag
        const [p1, p2] = Array.from(pointersRef.current.values());
        const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        pinchRef.current = { dist: d || 1, scale: scaleFactor };
        dragRef.current = null;
        dragMovedRef.current = true; // suppress accidental click-through
        return;
      }

      // single pointer — start drag
      isDraggingRef.current = true;
      dragMovedRef.current = false;
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        rot: [...rotation] as [number, number],
      };
    },
    [rotation, scaleFactor],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // pinch path
      if (pointersRef.current.size === 2 && pinchRef.current) {
        const [p1, p2] = Array.from(pointersRef.current.values());
        const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const ratio = d / pinchRef.current.dist;
        const next = pinchRef.current.scale * ratio;
        setScaleFactor(
          Math.max(MIN_SCALE_FACTOR, Math.min(MAX_SCALE_FACTOR, next)),
        );
        return;
      }

      // drag path
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      if (Math.hypot(dx, dy) > 9) dragMovedRef.current = true;
      const k = ROTATE_SENSITIVITY / Math.max(0.5, scaleFactor);
      const newLambda = dragRef.current.rot[0] + dx * k;
      const newPhi = Math.max(-88, Math.min(88, dragRef.current.rot[1] - dy * k));
      queueRotation([newLambda, newPhi]);
    },
    [scaleFactor, queueRotation],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      isDraggingRef.current = false;
    }
    // dragMovedRef intentionally NOT reset here — click handlers fire next.
  }, []);

  // cancel pending rotation RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // wheel zoom
  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setScaleFactor((s) => {
      const factor = Math.exp(-e.deltaY * 0.0014);
      return Math.max(MIN_SCALE_FACTOR, Math.min(MAX_SCALE_FACTOR, s * factor));
    });
  }, []);

  // attach a non-passive wheel listener so preventDefault works
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScaleFactor((s) => {
        const factor = Math.exp(-e.deltaY * 0.0014);
        return Math.max(MIN_SCALE_FACTOR, Math.min(MAX_SCALE_FACTOR, s * factor));
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // animate rotation toward a target country (used on lens select)
  const animRef = useRef<number | null>(null);
  const animateToCountry = useCallback((code: string) => {
    const c = findCountry(code);
    if (!c) return;
    // orthographic rotate is [-lon, -lat] to face point
    const target: [number, number] = [-c.lon, -c.lat];
    const startTime = performance.now();
    const duration = 850;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setRotation((current) => {
      const start = current;
      // shortest angular path for lambda
      let dl = target[0] - start[0];
      while (dl > 180) dl -= 360;
      while (dl < -180) dl += 360;
      const dp = target[1] - start[1];

      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setRotation([start[0] + dl * eased, start[1] + dp * eased]);
        if (t < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          animRef.current = null;
        }
      };
      animRef.current = requestAnimationFrame(step);
      return start;
    });
  }, []);

  // when user selects a country (via lens or click) — pan globe to it
  useEffect(() => {
    if (selectedCountry) animateToCountry(selectedCountry);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selectedCountry, animateToCountry]);

  // demo mode: drift longitude continuously (~6°/sec) when nobody's dragging
  // and there's no in-flight pan animation. selectedCountry is read through
  // a ref so opening the lens doesn't tear down the rAF chain (which trips
  // 'Maximum update depth' under React's dev-mode tracking).
  const selectedCountryRef = useRef<string | null>(selectedCountry);
  useEffect(() => {
    selectedCountryRef.current = selectedCountry;
  }, [selectedCountry]);

  useEffect(() => {
    if (!autoRotate || autoRotate <= 0) return;
    const degPerMs = autoRotate / 1000;
    let raf: number | null = null;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (
        !isDraggingRef.current &&
        animRef.current === null &&
        !selectedCountryRef.current
      ) {
        setRotation(([lon, lat]) => [lon + dt * degPerMs, lat]);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [autoRotate]);

  // ----- Submit & ping --------------------------------------------------
  const handleSubmitConcern = useCallback(
    (input: { age: number; countryCode: string; text: string; category: ConcernCategory }) => {
      onSubmit(input);
      const country = findCountry(input.countryCode);
      if (!country) return;
      // rotate to face their country, then ping
      animateToCountry(input.countryCode);
      const p = projection([country.lon, country.lat]);
      if (p) {
        const id = `ping-${Date.now()}`;
        setPings((q) => [...q, { id, x: p[0], y: p[1] }]);
        window.setTimeout(() => {
          setPings((q) => q.filter((r) => r.id !== id));
        }, 1500);
      }
      // open lens after a moment
      window.setTimeout(() => selectCountry(input.countryCode), 1300);
    },
    [onSubmit, animateToCountry, projection, selectCountry],
  );

  // ----- Plotted dots (only visible side) ------------------------------
  const plotted = useMemo(() => {
    return concerns.slice(-260).map((c) => {
      const country = findCountry(c.countryCode);
      if (!country) return null;
      let h = 0;
      for (let i = 0; i < c.id.length; i++) h = (h * 31 + c.id.charCodeAt(i)) >>> 0;
      // deterministic offset in [-1, 1] per axis
      const ox = (((h >>> 0) % 1000) / 1000 - 0.5) * 2;
      const oy = ((((h * 7) >>> 0) % 1000) / 1000 - 0.5) * 2;
      // big countries (US, RU, CA, etc.) declare spread half-widths in
      // countries.ts so dots scatter across the country instead of piling
      // on the centroid. small countries fall through to a tight default.
      const spreadLon = country.spread?.lon ?? 1.5;
      const spreadLat = country.spread?.lat ?? 1.0;
      const p = projectIfVisible(
        projection,
        country.lon + ox * spreadLon,
        country.lat + oy * spreadLat,
      );
      if (!p) return null;
      return {
        c,
        x: Math.round(p[0] * 100) / 100,
        y: Math.round(p[1] * 100) / 100,
      };
    }).filter(Boolean) as { c: Concern; x: number; y: number }[];
  }, [concerns, projection]);

  // hover meta
  const hoverCount = useMemo(() => {
    if (!hoverCountry) return 0;
    return concerns.filter((c) => c.countryCode === hoverCountry).length;
  }, [hoverCountry, concerns]);

  // sphere outline d (cheap arc)
  const sphereOutline = useMemo(() => {
    const [cx, cy] = center;
    const r = globeRadius;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }, [center, globeRadius]);

  return (
    <section className="relative isolate flex h-screen min-h-[700px] flex-col overflow-hidden bg-ink text-bone">
      {/* TOP BAR */}
      <div className="relative z-30 flex items-center justify-between border-b border-bone/10 bg-ink/40 px-5 py-3 backdrop-blur sm:px-10 sm:py-4">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/70 sm:text-xs">
          <span className="live-dot" aria-hidden />
          <span className="hidden sm:inline">listening · global record</span>
          <span className="sm:hidden">live</span>
        </div>

        <h1 className="font-serif text-base italic text-bone sm:text-2xl">
          what is your <span className="text-blood">concern</span>?
        </h1>

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 sm:gap-4">
          <DonateLink variant="compact" />
          <button
            onClick={() => setShareOpen(true)}
            className="hidden border border-bone/30 px-3 py-1.5 transition hover:border-blood hover:text-blood sm:inline-block"
          >
            share ↗
          </button>
          <button
            onClick={() => openPost()}
            // hidden on mobile — there's a smaller top-center pair below the
            // top bar that covers post + explore on small viewports
            className="hidden bg-blood px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone transition hover:bg-bone hover:text-blood sm:inline-flex"
          >
            + post yours
          </button>
        </div>
      </div>

      {/* THE PLANET */}
      <div
        ref={wrapRef}
        // mobile: touch-action: none — drag rotates the globe (scrolling
        // is via the visible 'explore the record ↓' button instead).
        // desktop: pan-y pinch-zoom so wheel scrolling past works.
        className="globe-touch relative flex-1 select-none overflow-hidden"
      >
        {/* stars */}
        <div className="pointer-events-none absolute inset-0">
          <svg width="100%" height="100%" preserveAspectRatio="none">
            {stars.map((s, i) => (
              <circle
                key={i}
                cx={`${s.x}%`}
                cy={`${s.y}%`}
                r={s.r}
                fill="#faf6ed"
                opacity={s.o}
              />
            ))}
          </svg>
        </div>

        {/* the globe */}
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="xMidYMid slice"
          className={`absolute inset-0 h-full w-full ${
            isDraggingRef.current ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          aria-label="Interactive 3D globe showing anonymous concerns posted by people around the world. Drag to rotate, scroll or pinch to zoom, click a country for its dossier."
          role="application"
        >
          <defs>
            <radialGradient id="oceanG" cx="35%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#1a2235" />
              <stop offset="55%" stopColor="#0e1623" />
              <stop offset="100%" stopColor="#04060a" />
            </radialGradient>
            <radialGradient id="atmoOuterG" cx="50%" cy="50%" r="50%">
              <stop offset="86%" stopColor="rgba(80,150,200,0)" />
              <stop offset="93%" stopColor="rgba(120,170,230,0.32)" />
              <stop offset="98%" stopColor="rgba(120,170,230,0.10)" />
              <stop offset="100%" stopColor="rgba(120,170,230,0)" />
            </radialGradient>
            <radialGradient id="specularG" cx="32%" cy="22%" r="42%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <radialGradient id="terminatorG" cx="100%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="55%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
            </radialGradient>
            <radialGradient id="dotGradG2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6a4d" stopOpacity="1" />
              <stop offset="55%" stopColor="#c7321b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8a1f0c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* atmospheric outer glow */}
          <circle
            cx={center[0]}
            cy={center[1]}
            r={globeRadius + 22}
            fill="url(#atmoOuterG)"
            pointerEvents="none"
          />

          {/* sphere ocean */}
          <circle
            cx={center[0]}
            cy={center[1]}
            r={globeRadius}
            fill="url(#oceanG)"
          />

          {/* graticule (latitude/longitude grid) */}
          <path
            d={pathGen(graticule) ?? ""}
            fill="none"
            stroke="rgba(250,246,237,0.06)"
            strokeWidth={0.6}
            pointerEvents="none"
          />

          {/* country fills */}
          {topo &&
            topo.features.map((f, i) => {
              const m49 = String((f as { id?: string | number }).id ?? "").padStart(3, "0");
              const iso = findByM49(m49)?.code;
              const isHover = iso && hoverCountry === iso;
              const isSelected = iso && selectedCountry === iso;
              const d = pathGen(f);
              if (!d) return null;
              return (
                <path
                  key={i}
                  d={d}
                  className="country-base"
                  fill={
                    isSelected
                      ? "rgba(199,50,27,0.42)"
                      : isHover
                        ? "rgba(199,50,27,0.20)"
                        : "rgba(245,234,205,0.12)"
                  }
                  stroke={
                    isSelected
                      ? "rgba(255,148,118,0.92)"
                      : isHover
                        ? "rgba(255,148,118,0.55)"
                        : "rgba(245,234,205,0.20)"
                  }
                  strokeWidth={isSelected ? 1.2 : isHover ? 0.95 : 0.55}
                  onMouseEnter={() => iso && setHoverCountry(iso)}
                  onMouseLeave={() =>
                    setHoverCountry((p) => (p === iso ? null : p))
                  }
                  style={{ cursor: iso ? "pointer" : "default" }}
                  onClick={(e) => {
                    if (dragMovedRef.current) return;
                    e.stopPropagation();
                    if (iso) selectCountry(iso);
                  }}
                />
              );
            })}

          {/* dots — sized in proportion to the globe so they scale with zoom */}
          {(() => {
            const dotRadius = Math.max(2.2, globeRadius * 0.014);
            const innerRadius = Math.max(0.8, globeRadius * 0.0035);
            return plotted.map(({ c, x, y }) => {
              const inSel = c.countryCode === selectedCountry;
              return (
                <g
                  key={c.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    if (dragMovedRef.current) return;
                    e.stopPropagation();
                    onOpen(c);
                    selectCountry(c.countryCode);
                  }}
                >
                  <circle
                    r={dotRadius * (inSel ? 1.35 : 1)}
                    fill="url(#dotGradG2)"
                    opacity={inSel ? 0.95 : 0.6}
                  />
                  <circle
                    r={innerRadius * (inSel ? 1.4 : 1)}
                    fill="#ffb19a"
                    opacity={inSel ? 1 : 0.92}
                  />
                </g>
              );
            });
          })()}

          {/* user submit pings */}
          {pings.map((p) => (
            <g key={p.id} transform={`translate(${p.x},${p.y})`} className="ping">
              <circle r={4} fill="none" stroke="#d4a24a" strokeWidth={1.5} />
            </g>
          ))}

          {/* terminator (day/night feel — subtle right-side darkening) */}
          <circle
            cx={center[0]}
            cy={center[1]}
            r={globeRadius}
            fill="url(#terminatorG)"
            pointerEvents="none"
          />

          {/* specular highlight */}
          <circle
            cx={center[0]}
            cy={center[1]}
            r={globeRadius}
            fill="url(#specularG)"
            pointerEvents="none"
          />

          {/* sphere outline */}
          <path
            d={sphereOutline}
            fill="none"
            stroke="rgba(140,180,220,0.18)"
            strokeWidth={1}
            pointerEvents="none"
          />
        </svg>

        {/* scan line */}
        <div className="scan-line" />

        {/* HTML bubble layer */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {bubbles.map((b) => {
              const country = findCountry(b.concern.countryCode);
              if (!country) return null;
              const p = projectIfVisible(projection, country.lon, country.lat);
              if (!p) return null;
              return (
                <BubbleCard
                  key={b.id}
                  bubble={b}
                  x={p[0]}
                  y={p[1]}
                  isMobile={size.w < 700}
                  onClick={() => {
                    onOpen(b.concern);
                    selectCountry(b.concern.countryCode);
                  }}
                  onDismiss={() => dismissBubble(b.id)}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* hover label */}
        <AnimatePresence>
          {hoverCountry && (
            <motion.div
              key={hoverCountry}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none absolute bottom-6 left-6 z-20 border border-bone/20 bg-ink/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/85 backdrop-blur"
            >
              {findCountry(hoverCountry)?.name ?? hoverCountry}
              {hoverCount > 0 ? (
                <span className="ml-3 text-blood">{hoverCount} voices</span>
              ) : (
                <span className="ml-3 text-bone/45">listening…</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* corner stat block */}
        <div className="pointer-events-none absolute right-5 top-5 z-20 hidden flex-col items-end gap-1 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-bone/65 sm:flex">
          <span>
            <span className="shimmer">{concerns.length.toLocaleString()}</span> voices
          </span>
          <span>{totalCountries} countries</span>
          <span>{responses.toLocaleString()} responses</span>
        </div>

        {/* empty state — only after the first poll has resolved with zero rows.
            Without this guard the cue flashes for ~half a second on every page
            load before the API responds. */}
        {loaded && concerns.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 px-6 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
              the record is empty
            </span>
            <p className="max-w-md font-serif text-2xl italic leading-snug text-bone/85 sm:text-3xl">
              be the first to speak.
            </p>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood">
              ↓ post yours below
            </span>
          </div>
        )}

        {/* gestures hint */}
        <div className="pointer-events-none absolute left-5 top-5 z-20 hidden flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/45 sm:flex">
          <span>drag · rotate</span>
          <span>scroll · zoom</span>
          <span>click country · open lens</span>
        </div>

        {/* zoom pill */}
        <div className="pointer-events-auto absolute bottom-6 right-5 z-20 hidden flex-col gap-1 font-mono text-[10px] tracking-[0.22em] text-bone/60 sm:flex">
          <button
            onClick={() => setScaleFactor((s) => Math.min(MAX_SCALE_FACTOR, s * 1.18))}
            className="border border-bone/25 bg-ink/60 px-3 py-1.5 backdrop-blur transition hover:border-blood hover:text-blood"
            aria-label="zoom in"
          >
            +
          </button>
          <button
            onClick={() => setScaleFactor((s) => Math.max(MIN_SCALE_FACTOR, s * 0.85))}
            className="border border-bone/25 bg-ink/60 px-3 py-1.5 backdrop-blur transition hover:border-blood hover:text-blood"
            aria-label="zoom out"
          >
            −
          </button>
          <button
            onClick={() => {
              setRotation(INITIAL_ROTATION);
              setScaleFactor(1);
            }}
            className="border border-bone/25 bg-ink/60 px-2 py-1 text-[8px] uppercase backdrop-blur transition hover:border-bone hover:text-bone"
            aria-label="reset view"
          >
            reset
          </button>
        </div>

        {/* Action pair — post + scroll-to-explore.
            On mobile: small pills near the top of the globe section, just
            under the top bar (avoids Chrome's bottom URL bar covering them).
            On desktop: bottom-center as before. */}
        <div
          className="
            pointer-events-auto absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5
            top-[3.75rem]
            sm:top-auto sm:bottom-6 sm:gap-2
          "
        >
          <button
            onClick={() => openPost()}
            className="
              inline-flex items-center justify-center gap-1.5 bg-blood text-bone transition hover:bg-bone hover:text-blood
              px-3 py-1.5 text-[9px] tracking-[0.22em] font-mono uppercase
              sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.28em] sm:gap-2
            "
          >
            <span>+ post yours</span>
          </button>
          <button
            onClick={() => {
              if (typeof document !== "undefined") {
                document
                  .getElementById("explore")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="
              inline-flex items-center justify-center gap-1.5 border border-bone/25 bg-ink/80 backdrop-blur transition hover:border-blood hover:text-blood text-bone
              px-3 py-1.5 text-[9px] tracking-[0.22em] font-mono uppercase
              sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.28em] sm:gap-2 sm:bg-ink/70 sm:text-bone/80
            "
            aria-label="scroll to explore"
          >
            <span className="hidden sm:inline">explore the record</span>
            <span className="sm:hidden">explore</span>
            <span className="float-down text-blood">↓</span>
          </button>
        </div>
      </div>

      {/* country lens overlay */}
      <CountryLens
        open={!!selectedCountry}
        selectedCountry={selectedCountry}
        concerns={concerns}
        solutions={solutions}
        onSelectCountry={selectCountry}
        onClose={() => selectCountry(null)}
        onOpenConcern={onOpen}
        onPostForCountry={(code) => openPost(code)}
      />

      {/* post dialog */}
      <PostDialog
        open={postOpen}
        initialCountry={postInitialCountry}
        onClose={() => setPostOpen(false)}
        onSubmit={handleSubmitConcern}
      />

      {/* share dialog — same modal pattern as PostDialog post-submit, so the
          nav-bar share matches the in-flow share prompt the user already
          knows after they post */}
      <AnimatePresence>
        {shareOpen && (
          <>
            <motion.div
              key="share-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setShareOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/75 backdrop-blur-sm"
            />
            <motion.div
              key="share-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="share this place"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.2, 0.7, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-[70] w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 border border-bone/20 bg-ink-soft/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur"
            >
              <div className="flex items-center justify-between border-b border-bone/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/65">
                <span>share this place</span>
                <button
                  onClick={() => setShareOpen(false)}
                  className="text-bone/55 transition hover:text-blood"
                >
                  close ✕
                </button>
              </div>
              <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-8">
                <div>
                  <p className="font-serif text-2xl italic leading-snug text-bone sm:text-3xl">
                    pass it along.
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/55">
                    sharing is the only way the record grows.
                  </p>
                </div>
                <ShareLinks tone="dark" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

void COUNTRIES;

function BubbleCard({
  bubble,
  x,
  y,
  isMobile,
  onClick,
  onDismiss,
}: {
  bubble: Bubble;
  x: number;
  y: number;
  isMobile: boolean;
  onClick: () => void;
  onDismiss: () => void;
}) {
  const { concern, flavor } = bubble;
  const W = isMobile ? 220 : 320;
  const viewportW =
    typeof window !== "undefined" ? window.innerWidth : 1200;
  const left = Math.max(12, Math.min(x - W / 2, viewportW - W - 12));
  const top = Math.max(12, y - 130);
  const accent = flavor === "yours" ? "amber" : "blood";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.3, 1] }}
      className="bubble-glow pointer-events-auto absolute z-10 border border-bone/15 bg-ink-soft/85 backdrop-blur-sm hover:border-bone/30"
      style={{ width: W, left, top }}
    >
      {/* main tap area — opens drawer */}
      <button
        type="button"
        onClick={onClick}
        className="block w-full cursor-pointer p-4 pr-9 text-left"
      >
        <p className="clamp-3 font-serif text-[15px] italic leading-snug text-bone sm:text-lg">
          “{concern.text}”
        </p>
        <div
          className={`mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.25em] ${
            accent === "amber" ? "text-amber" : "text-bone/55"
          }`}
        >
          <span>
            {findCountry(concern.countryCode)?.name ?? concern.countryCode} · age{" "}
            {concern.age}
          </span>
          <span className="text-bone/45">tap →</span>
        </div>
      </button>

      {/* explicit dismiss */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="dismiss"
        className="absolute right-1 top-1 grid h-7 w-7 place-items-center text-bone/55 transition hover:text-blood"
      >
        <span className="text-base leading-none">×</span>
      </button>
    </motion.div>
  );
}
