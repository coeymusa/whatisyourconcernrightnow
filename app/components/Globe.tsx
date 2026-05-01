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
import { COUNTRIES, findCountry } from "../lib/countries";
import CountryLens from "./CountryLens";
import DonateLink from "./DonateLink";
import PostDialog from "./PostDialog";

const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const M49_TO_ISO2: Record<string, string> = {
  "840": "US","124": "CA","484": "MX","076": "BR","032": "AR","152": "CL","170": "CO",
  "604": "PE","862": "VE","826": "GB","372": "IE","250": "FR","276": "DE","724": "ES",
  "620": "PT","380": "IT","528": "NL","056": "BE","756": "CH","040": "AT","752": "SE",
  "578": "NO","208": "DK","246": "FI","616": "PL","203": "CZ","300": "GR","642": "RO",
  "348": "HU","804": "UA","643": "RU","792": "TR","376": "IL","422": "LB","818": "EG",
  "682": "SA","784": "AE","364": "IR","368": "IQ","586": "PK","356": "IN","050": "BD",
  "144": "LK","524": "NP","156": "CN","392": "JP","410": "KR","158": "TW","608": "PH",
  "704": "VN","764": "TH","458": "MY","702": "SG","360": "ID","036": "AU","554": "NZ",
  "710": "ZA","566": "NG","404": "KE","231": "ET","288": "GH","504": "MA","012": "DZ",
  "788": "TN","352": "IS","233": "EE","440": "LT","428": "LV",
};

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

  // sphere camera state
  const [rotation, setRotation] = useState<[number, number]>(INITIAL_ROTATION);
  const [scaleFactor, setScaleFactor] = useState(1);
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);

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

  // remove bubbles whose country has rotated to the back hemisphere
  useEffect(() => {
    setBubbles((prev) => {
      return prev.filter((b) => {
        const country = findCountry(b.concern.countryCode);
        if (!country) return false;
        return isFrontHemisphere(projection, country.lon, country.lat);
      });
    });
  }, [projection]);

  useEffect(() => {
    let cancelled = false;
    const isSmall = size.w < 700;
    const maxBubbles = isSmall ? 2 : 3;

    function tick() {
      if (cancelled) return;
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
          const p = projectIfVisible(projection, country.lon, country.lat);
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
            const bp = projection([bc.lon, bc.lat]);
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
              ttl: 6500 + Math.random() * 2500,
              flavor: "ambient",
            },
          ];
        }
        return live;
      });

      const nextDelay = 1500 + Math.random() * 1500;
      window.setTimeout(tick, nextDelay);
    }

    const t0 = window.setTimeout(tick, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(t0);
    };
  }, [size.w, size.h, projection]);

  // ----- Drag interactions ----------------------------------------------
  const dragRef = useRef<{ x: number; y: number; rot: [number, number] } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      dragMovedRef.current = false;
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        rot: [...rotation] as [number, number],
      };
      // Intentionally NOT calling setPointerCapture — it routes the
      // subsequent pointerup to the SVG and can suppress the click event
      // that should fire on the country path. The drag still works because
      // the SVG itself is the pointer-event listener.
    },
    [rotation],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    // generous deadband — fingers and trackpads jitter a few pixels on a
    // tap, and we don't want to suppress the click+select that follows.
    if (Math.hypot(dx, dy) > 9) dragMovedRef.current = true;
    const k = ROTATE_SENSITIVITY / Math.max(0.5, scaleFactor);
    const newLambda = dragRef.current.rot[0] + dx * k;
    const newPhi = Math.max(-88, Math.min(88, dragRef.current.rot[1] - dy * k));
    setRotation([newLambda, newPhi]);
  }, [scaleFactor]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    isDraggingRef.current = false;
    // dragMovedRef intentionally NOT reset here — click handlers fire next and
    // need to see whether the gesture moved. We reset on the next pointerdown.
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
      const dx = (((h >>> 0) % 1000) / 1000 - 0.5) * 4;
      const dy = ((((h * 7) >>> 0) % 1000) / 1000 - 0.5) * 3;
      const p = projectIfVisible(
        projection,
        country.lon + dx * 0.5,
        country.lat + dy * 0.4,
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

        <h1 className="font-serif text-base italic text-bone sm:text-lg">
          what is your <span className="text-blood">concern</span>, right now?
        </h1>

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 sm:gap-4">
          <a
            href="https://github.com/coeymusa/What-is-your-concern"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-bone/55 transition hover:text-bone sm:inline-flex"
            aria-label="view source on github"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="hidden lg:inline">open source</span>
          </a>
          <DonateLink variant="compact" />
          <button
            onClick={() => {
              const url = "https://whatisyourconcern.com";
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator
                  .share({ title: "what is your concern, right now?", url })
                  .catch(() => {});
              } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(url).catch(() => {});
              }
            }}
            className="hidden border border-bone/30 px-3 py-1.5 transition hover:border-blood hover:text-blood sm:inline-block"
          >
            share ↗
          </button>
          <button
            onClick={() => setPostOpen(true)}
            className="bg-blood px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone transition hover:bg-bone hover:text-blood sm:px-4 sm:py-2"
          >
            + post yours
          </button>
        </div>
      </div>

      {/* THE PLANET */}
      <div
        ref={wrapRef}
        className="relative flex-1 select-none overflow-hidden"
        style={{ touchAction: "none" }}
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
          aria-label="3D globe of concerns"
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
              const iso = M49_TO_ISO2[m49];
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
                  onClick={() => {
                    onOpen(b.concern);
                    selectCountry(b.concern.countryCode);
                  }}
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

        {/* bottom action pair — post + scroll-to-explore */}
        <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          <button
            onClick={() => setPostOpen(true)}
            className="inline-flex items-center gap-2 bg-blood px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-bone transition hover:bg-bone hover:text-blood"
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
            className="inline-flex items-center gap-2 border border-bone/25 bg-ink/70 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-bone/80 backdrop-blur transition hover:border-blood hover:text-blood"
            aria-label="scroll to explore"
          >
            <span>explore the record</span>
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
      />

      {/* post dialog */}
      <PostDialog
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onSubmit={handleSubmitConcern}
      />
    </section>
  );
}

void COUNTRIES;

function BubbleCard({
  bubble,
  x,
  y,
  onClick,
}: {
  bubble: Bubble;
  x: number;
  y: number;
  onClick: () => void;
}) {
  const { concern, flavor } = bubble;
  const W = 320;
  const left = Math.max(
    12,
    Math.min(
      x - W / 2,
      (typeof window !== "undefined" ? window.innerWidth : 1200) - W - 12,
    ),
  );
  const top = Math.max(12, y - 130);
  const accent = flavor === "yours" ? "amber" : "blood";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.3, 1] }}
      className="bubble-glow pointer-events-auto absolute z-10 cursor-pointer border border-bone/15 bg-ink-soft/85 p-4 text-left backdrop-blur-sm hover:border-bone/30"
      style={{ width: W, left, top }}
    >
      <p className="font-serif text-base italic leading-snug text-bone sm:text-lg">
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

      <svg
        className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2"
        width="2"
        height={Math.max(0, y - top - 90)}
        style={{ overflow: "visible" }}
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2={Math.max(0, y - top - 90)}
          stroke={accent === "amber" ? "rgba(212,162,74,0.7)" : "rgba(199,50,27,0.6)"}
          strokeWidth="1"
          strokeDasharray="2 3"
          className="draw-in"
        />
      </svg>
    </motion.button>
  );
}
