"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { motion, AnimatePresence } from "motion/react";
import type { Concern, ConcernCategory } from "../lib/types";
import { COUNTRIES, findCountry } from "../lib/countries";
import QuickAdd from "./QuickAdd";
import CountryLens from "./CountryLens";
import DonateLink from "./DonateLink";
import type { Solution } from "../lib/types";

const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// world-atlas country numeric IDs (M49) → ISO-2 — only the codes we care about for hover.
// Faster than fetching another mapping; we just match by name when needed.
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
  x: number;
  y: number;
  bornAt: number;
  ttl: number; // ms
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

const MIN_BUBBLE_GAP = 200; // px

function distance(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
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

  const selectCountry = useCallback((code: string | null) => {
    setSelectedCountry(code);
  }, []);

  // resize
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

  const projection = useMemo(
    () =>
      geoEqualEarth()
        .scale(Math.min(size.w / 6.0, size.h / 3.4))
        .translate([size.w / 2, size.h / 2 - 10]),
    [size.w, size.h],
  );

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  // map of country code -> [x, y] on screen (rounded to 2 dp to dodge SSR drift)
  const countryPoint = useCallback(
    (code: string): [number, number] | null => {
      const c = findCountry(code);
      if (!c) return null;
      const p = projection([c.lon, c.lat]);
      if (!p) return null;
      return [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
    },
    [projection],
  );

  // bubble cycling — only runs after projection is ready
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const concernsRef = useRef<Concern[]>(concerns);
  useEffect(() => {
    concernsRef.current = concerns;
  }, [concerns]);

  useEffect(() => {
    let cancelled = false;
    const isSmall = size.w < 700;
    const maxBubbles = isSmall ? 2 : 4;

    function tick() {
      if (cancelled) return;
      const now = Date.now();
      setBubbles((prev) => {
        // remove expired
        const live = prev.filter((b) => now - b.bornAt < b.ttl);

        if (live.length >= maxBubbles) return live;

        const concerns = concernsRef.current;
        if (concerns.length === 0) return live;

        // try several random picks for spacing
        for (let attempt = 0; attempt < 14; attempt++) {
          const c = concerns[Math.floor(Math.random() * concerns.length)];
          if (live.some((b) => b.concern.id === c.id)) continue;
          const pt = countryPoint(c.countryCode);
          if (!pt) continue;
          const [x, y] = pt;
          // require padding from edges so bubble fits on screen
          if (x < 130 || x > size.w - 130 || y < 130 || y > size.h - 80) continue;
          if (live.some((b) => distance(b.x, b.y, x, y) < MIN_BUBBLE_GAP)) continue;
          return [
            ...live,
            {
              id: `bubble-${now}-${attempt}`,
              concern: c,
              x,
              y,
              bornAt: now,
              ttl: 6500 + Math.random() * 2500,
              flavor: "ambient",
            },
          ];
        }
        return live;
      });

      const nextDelay = 1300 + Math.random() * 1400;
      window.setTimeout(tick, nextDelay);
    }

    const t0 = window.setTimeout(tick, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(t0);
    };
    // re-run when projection size changes meaningfully
  }, [size.w, size.h, countryPoint]);

  // when user submits, ping their country and surface a "yours" bubble
  const handleSubmitConcern = useCallback(
    (input: { age: number; countryCode: string; text: string; category: ConcernCategory }) => {
      onSubmit(input);
      const pt = countryPoint(input.countryCode);
      if (!pt) return;
      const [x, y] = pt;
      const id = `ping-${Date.now()}`;
      setPings((p) => [...p, { id, x, y }]);
      window.setTimeout(() => {
        setPings((p) => p.filter((q) => q.id !== id));
      }, 1500);
      // briefly show their concern as a bubble
      const concern: Concern = {
        id: `you-${Date.now()}`,
        age: input.age,
        bracket:
          input.age < 20
            ? "13–19"
            : input.age < 30
              ? "20–29"
              : input.age < 45
                ? "30–44"
                : input.age < 60
                  ? "45–59"
                  : "60+",
        countryCode: input.countryCode,
        text: input.text,
        category: input.category,
        ts: Date.now(),
      };
      setBubbles((prev) => [
        ...prev,
        {
          id: `yours-${Date.now()}`,
          concern,
          x,
          y,
          bornAt: Date.now(),
          ttl: 9000,
          flavor: "yours",
        },
      ]);
      // gently surface the country lens after the celebration animation lands
      window.setTimeout(() => selectCountry(input.countryCode), 1400);
    },
    [onSubmit, countryPoint, selectCountry],
  );

  // dot positions (rounded)
  const plotted = useMemo(() => {
    return concerns.slice(-260).map((c) => {
      const country = findCountry(c.countryCode);
      if (!country) return null;
      // small deterministic jitter using concern id hash
      let h = 0;
      for (let i = 0; i < c.id.length; i++) h = (h * 31 + c.id.charCodeAt(i)) >>> 0;
      const dx = (((h >>> 0) % 1000) / 1000 - 0.5) * 4;
      const dy = ((((h * 7) >>> 0) % 1000) / 1000 - 0.5) * 3;
      const p = projection([country.lon + dx * 0.5, country.lat + dy * 0.4]);
      if (!p) return null;
      return {
        c,
        x: Math.round(p[0] * 100) / 100,
        y: Math.round(p[1] * 100) / 100,
      };
    }).filter(Boolean) as { c: Concern; x: number; y: number }[];
  }, [concerns, projection]);

  // hover country handling for fills
  const hoverCount = useMemo(() => {
    if (!hoverCountry) return 0;
    return concerns.filter((c) => c.countryCode === hoverCountry).length;
  }, [hoverCountry, concerns]);

  return (
    <section className="relative isolate flex h-screen min-h-[680px] flex-col overflow-hidden bg-ink text-bone vignette">
      {/* top bar */}
      <div className="relative z-30 flex items-center justify-between border-b border-bone/10 bg-ink/40 px-5 py-3 backdrop-blur sm:px-10 sm:py-4">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/70 sm:text-xs">
          <span className="live-dot" aria-hidden />
          <span className="hidden sm:inline">listening · global record</span>
          <span className="sm:hidden">live</span>
        </div>

        <h1 className="font-serif text-base italic text-bone sm:text-lg">
          what is your <span className="text-blood">concern</span>, right now?
        </h1>

        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
          <DonateLink variant="compact" />
          <button
            onClick={() => {
              const url = "https://whatisyourconcernrightnow.com";
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
        </div>
      </div>

      {/* the planet */}
      <div
        ref={wrapRef}
        className="relative flex-1 overflow-hidden reticle-cursor"
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-label="World map of concerns"
        >
          <defs>
            <radialGradient id="dotGradG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6a4d" stopOpacity="1" />
              <stop offset="55%" stopColor="#c7321b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8a1f0c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="atmoGradG" cx="50%" cy="50%" r="60%">
              <stop offset="55%" stopColor="#0a0908" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
            </radialGradient>
            <linearGradient id="bgFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0908" />
              <stop offset="100%" stopColor="#08070a" />
            </linearGradient>
          </defs>

          {/* base background */}
          <rect width={size.w} height={size.h} fill="url(#bgFade)" />

          {/* graticule */}
          <g className="graticule celestial">
            <path
              d={pathGen(graticule) ?? ""}
              fill="none"
              stroke="rgba(250,246,237,0.06)"
              strokeWidth={0.7}
            />
          </g>

          {/* country fills */}
          {topo && (
            <g>
              {topo.features.map((f, i) => {
                const m49 = String((f as { id?: string | number }).id ?? "").padStart(3, "0");
                const iso = M49_TO_ISO2[m49];
                const isHover = iso && hoverCountry === iso;
                const isSelected = iso && selectedCountry === iso;
                return (
                  <path
                    key={i}
                    d={pathGen(f) ?? ""}
                    className={`country-base ${isHover ? "country-hover" : ""}`}
                    fill={
                      isSelected
                        ? "rgba(199,50,27,0.32)"
                        : isHover
                          ? "rgba(199,50,27,0.16)"
                          : "rgba(250,246,237,0.025)"
                    }
                    stroke={
                      isSelected
                        ? "rgba(255,138,110,0.85)"
                        : isHover
                          ? "rgba(255,138,110,0.55)"
                          : "rgba(250,246,237,0.16)"
                    }
                    strokeWidth={isSelected ? 1.2 : isHover ? 0.9 : 0.55}
                    onMouseEnter={() => iso && setHoverCountry(iso)}
                    onMouseLeave={() =>
                      setHoverCountry((p) => (p === iso ? null : p))
                    }
                    style={{ cursor: iso ? "pointer" : "default" }}
                    onClick={() => {
                      if (!iso) return;
                      selectCountry(iso);
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* concern dots */}
          <g>
            {plotted.map(({ c, x, y }) => {
              const inSelection = c.countryCode === selectedCountry;
              return (
                <g
                  key={c.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(c);
                    selectCountry(c.countryCode);
                  }}
                >
                  <circle
                    r={inSelection ? 7 : 5.5}
                    fill="url(#dotGradG)"
                    opacity={inSelection ? 0.85 : 0.55}
                  />
                  <circle
                    r={inSelection ? 1.8 : 1.4}
                    fill="#ffb19a"
                    opacity={inSelection ? 1 : 0.9}
                  />
                </g>
              );
            })}
          </g>

          {/* user submit pings */}
          <g>
            {pings.map((p) => (
              <g key={p.id} transform={`translate(${p.x},${p.y})`} className="ping">
                <circle r={4} fill="none" stroke="#d4a24a" strokeWidth={1.5} />
              </g>
            ))}
          </g>

          {/* atmospheric vignette */}
          <rect width={size.w} height={size.h} fill="url(#atmoGradG)" pointerEvents="none" />
        </svg>

        {/* scan line */}
        <div className="scan-line" />

        {/* HTML bubble layer */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {bubbles.map((b) => (
              <BubbleCard
                key={b.id}
                bubble={b}
                onClick={() => {
                  onOpen(b.concern);
                  selectCountry(b.concern.countryCode);
                }}
              />
            ))}
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

        {/* scroll cue */}
        <div className="pointer-events-none absolute bottom-32 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55 sm:flex">
          <span>scroll · listen deeper</span>
          <span className="float-down text-blood">↓</span>
        </div>
      </div>

      {/* persistent quick add */}
      <div className="relative z-30">
        <QuickAdd onSubmit={handleSubmitConcern} />
      </div>

      {/* country lens — slides in over the right side */}
      <CountryLens
        open={!!selectedCountry}
        selectedCountry={selectedCountry}
        concerns={concerns}
        solutions={solutions}
        onSelectCountry={selectCountry}
        onClose={() => selectCountry(null)}
        onOpenConcern={onOpen}
      />
    </section>
  );
}

// keep COUNTRIES referenced for tree-shaking optimisation
void COUNTRIES;

function BubbleCard({
  bubble,
  onClick,
}: {
  bubble: Bubble;
  onClick: () => void;
}) {
  const { concern, x, y, flavor } = bubble;
  // bubble centred above the dot
  const W = 320;
  // clamp so it never goes off-screen left/right
  const left = Math.max(12, Math.min(x - W / 2, (typeof window !== "undefined" ? window.innerWidth : 1200) - W - 12));
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

      {/* connector */}
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
