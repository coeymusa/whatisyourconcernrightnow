"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { motion, AnimatePresence } from "motion/react";
import type { Concern } from "../lib/types";
import { CATEGORY_LABELS } from "../lib/types";
import { COUNTRIES, findCountry } from "../lib/countries";

const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Props = {
  concerns: Concern[];
  onOpen?: (concern: Concern) => void;
};

// jitter a fixed seed offset for each concern so multiple from same country don't stack
function hashOffset(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const a = ((h >>> 0) % 1000) / 1000;
  const b = (((h * 7) >>> 0) % 1000) / 1000;
  return [(a - 0.5) * 5, (b - 0.5) * 4];
}

export default function WorldMap({ concerns, onOpen }: Props) {
  const [topo, setTopo] = useState<FeatureCollection<Geometry> | null>(null);
  const [hover, setHover] = useState<Concern | null>(null);
  const [size, setSize] = useState({ w: 1100, h: 600 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const [recentArrival, setRecentArrival] = useState<string | null>(null);

  // load topology
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
      .catch(() => {
        /* allow page to render without map outlines */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // responsive sizing
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const w = e.contentRect.width;
      const h = Math.max(360, Math.min(720, w * 0.55));
      setSize({ w, h });
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // arrival highlight: when concerns array grows, briefly highlight latest
  const lastIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (concerns.length === 0) return;
    const latest = concerns[concerns.length - 1];
    if (latest.id !== lastIdRef.current) {
      lastIdRef.current = latest.id;
      setRecentArrival(latest.id);
      const t = window.setTimeout(() => setRecentArrival(null), 4500);
      return () => window.clearTimeout(t);
    }
  }, [concerns]);

  const projection = useMemo(
    () =>
      geoEqualEarth()
        .scale(size.w / 6.3)
        .translate([size.w / 2, size.h / 2 + 10]),
    [size.w, size.h],
  );

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  // density per country code (used for label sizing on hover layer)
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of concerns) m.set(c.countryCode, (m.get(c.countryCode) ?? 0) + 1);
    return m;
  }, [concerns]);

  // limit dots rendered to keep SVG light; show all concerns per recency
  const plotted = useMemo(() => {
    return concerns.slice(-400).map((c) => {
      const country = findCountry(c.countryCode);
      if (!country) return null;
      const [dx, dy] = hashOffset(c.id);
      const point = projection([country.lon + dx * 0.6, country.lat + dy * 0.5]);
      if (!point) return null;
      // round to 2 decimals to avoid SSR/CSR float-precision hydration drift
      return { c, x: Math.round(point[0] * 100) / 100, y: Math.round(point[1] * 100) / 100 };
    }).filter(Boolean) as { c: Concern; x: number; y: number }[];
  }, [concerns, projection]);

  return (
    <section className="paper-grain-dark relative isolate overflow-hidden bg-ink py-20 text-bone sm:py-28">
      {/* section masthead */}
      <div className="px-5 sm:px-10 lg:px-16">
        <div className="flex items-end justify-between border-b border-bone/15 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/60">
              § 03 — the world of concern
            </div>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight text-bone sm:text-5xl">
              every dot is a person.<span className="text-blood"> every pulse is a fear.</span>
            </h2>
          </div>
          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50 sm:flex">
            <span className="live-dot" /> live · streaming
          </div>
        </div>
      </div>

      <div ref={wrapRef} className="relative mt-8 w-full">
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full"
          aria-label="World map of concerns"
        >
          <defs>
            <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6a4d" stopOpacity="1" />
              <stop offset="60%" stopColor="#c7321b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8a1f0c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="atmoGrad" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#0a0908" stopOpacity="0" />
              <stop offset="100%" stopColor="#1c1815" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* graticule (lat/long grid) */}
          <g className="graticule">
            <path
              d={pathGen(graticule) ?? ""}
              fill="none"
              stroke="rgba(250,246,237,0.07)"
              strokeWidth={0.7}
            />
          </g>

          {/* country outlines */}
          {topo && (
            <g>
              {topo.features.map((f, i) => (
                <path
                  key={i}
                  d={pathGen(f) ?? ""}
                  fill="rgba(250,246,237,0.025)"
                  stroke="rgba(250,246,237,0.18)"
                  strokeWidth={0.55}
                />
              ))}
            </g>
          )}

          {/* concern dots */}
          <g>
            {plotted.map(({ c, x, y }) => {
              const recent = c.id === recentArrival;
              return (
                <g
                  key={c.id}
                  transform={`translate(${x},${y})`}
                  onMouseEnter={() => setHover(c)}
                  onMouseLeave={() => setHover((h) => (h?.id === c.id ? null : h))}
                  onClick={() => onOpen?.(c)}
                  style={{ cursor: "pointer" }}
                >
                  {recent && (
                    <>
                      <circle r={1.5} fill="none" stroke="#ff6a4d" strokeWidth={1.2} className="pulse-ring" />
                      <circle r={1.5} fill="none" stroke="#ff6a4d" strokeWidth={1} className="pulse-ring delay-1" />
                      <circle r={1.5} fill="none" stroke="#ff6a4d" strokeWidth={0.9} className="pulse-ring delay-2" />
                    </>
                  )}
                  <circle r={6} fill="url(#dotGrad)" opacity={recent ? 1 : 0.55} />
                  <circle r={1.5} fill="#ffb19a" opacity={recent ? 1 : 0.85} />
                </g>
              );
            })}
          </g>

          {/* atmospheric vignette */}
          <rect width={size.w} height={size.h} fill="url(#atmoGrad)" pointerEvents="none" />
        </svg>

        {/* legend */}
        <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-blood">●</span> {plotted.length.toLocaleString()} entries plotted ·{" "}
            {counts.size} countries
          </div>
          <div className="hidden sm:block">
            equal earth projection · hover any dot
          </div>
        </div>

        {/* hover card */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute left-6 top-6 max-w-sm border border-bone/30 bg-ink-soft/95 p-4 backdrop-blur"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood">
                {findCountry(hover.countryCode)?.name ?? hover.countryCode} · age {hover.age}
              </div>
              <div className="mt-3 font-serif text-xl italic leading-snug text-bone">
                “{hover.text}”
              </div>
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/50">
                {CATEGORY_LABELS[hover.category]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* density rail */}
      <div className="mt-10 px-5 sm:px-10 lg:px-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/55">
          loudest
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-bone/85">
          {[...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([code, n]) => (
              <span key={code} className="inline-flex items-baseline gap-2">
                <span className="text-bone">{findCountry(code)?.name ?? code}</span>
                <span className="text-blood">{n}</span>
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}

// keep COUNTRIES referenced for tree-shaking optimisation hint
void COUNTRIES;
