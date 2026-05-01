import { ImageResponse } from "next/og";
import {
  fetchCategoryCounts,
  fetchCountryCounts,
  hasSupabase,
} from "../lib/supabase";
import { CATEGORY_LABELS, type ConcernCategory } from "../lib/types";

export const alt = "what is your concern? — the pulse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function thisWeekIso(): string {
  const d = new Date();
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}·W${String(weekNum).padStart(2, "0")}`;
}

export default async function PulseOG() {
  const on = hasSupabase();
  const [countryCounts, categoryCounts] = await Promise.all([
    on ? fetchCountryCounts() : Promise.resolve(new Map<string, number>()),
    on ? fetchCategoryCounts() : Promise.resolve(new Map<string, number>()),
  ]);

  const totalVoices = [...countryCounts.values()].reduce((a, b) => a + b, 0);
  const liveCountries = countryCounts.size;
  const topCat = [...categoryCounts.entries()]
    .filter(([k]) => k !== "other")
    .sort((a, b) => b[1] - a[1])[0];
  const topConcern = topCat
    ? CATEGORY_LABELS[topCat[0] as ConcernCategory].split(" ")[0].toLowerCase()
    : "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: "#0a0908",
          color: "#faf6ed",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 15,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "rgba(250,246,237,0.7)",
            fontFamily: "monospace",
            paddingBottom: 14,
            borderBottom: "1px solid rgba(250,246,237,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#c7321b",
              }}
            />
            <span>live · the record</span>
          </div>
          <div style={{ display: "flex" }}>
            {`vol. I · issue ${thisWeekIso()}`}
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 14,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(250,246,237,0.55)",
            fontFamily: "monospace",
            display: "flex",
          }}
        >
          {`§ issue ${thisWeekIso()} — the pulse`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            fontStyle: "italic",
            fontSize: 124,
            lineHeight: 0.95,
            letterSpacing: -1.5,
          }}
        >
          <div style={{ display: "flex" }}>What is</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#c7321b" }}>the world</span>
          </div>
          <div style={{ display: "flex" }}>afraid of?</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "rgba(250,246,237,0.7)",
            paddingTop: 18,
            borderTop: "1px solid rgba(250,246,237,0.2)",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "rgba(250,246,237,0.5)", fontSize: 13 }}>
              voices recorded
            </span>
            <span
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: 44,
                color: "#c7321b",
                letterSpacing: -0.5,
              }}
            >
              {totalVoices.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "rgba(250,246,237,0.5)", fontSize: 13 }}>
              countries live
            </span>
            <span
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: 44,
                color: "#d4a24a",
                letterSpacing: -0.5,
              }}
            >
              {liveCountries.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "rgba(250,246,237,0.5)", fontSize: 13 }}>
              loudest topic
            </span>
            <span
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: 44,
                color: "#faf6ed",
                letterSpacing: -0.5,
              }}
            >
              {topConcern}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-end",
            }}
          >
            <span style={{ color: "rgba(250,246,237,0.5)", fontSize: 13 }}>
              read more
            </span>
            <span
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: 28,
                color: "#faf6ed",
              }}
            >
              whatisyourconcern.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
