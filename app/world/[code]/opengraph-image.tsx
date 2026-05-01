import { ImageResponse } from "next/og";
import { COUNTRIES, findCountry } from "../../lib/countries";
import { fetchByCountry, hasSupabase } from "../../lib/supabase";

// Runs on Node.js — Edge runtime conflicts with generateStaticParams.
export const alt = "what is your concern? — country dossier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [
    "US", "GB", "CA", "AU", "IN", "BR", "JP", "DE", "FR", "MX",
    "RU", "CN", "ZA", "NG", "ID", "PH", "TR", "IR", "EG", "KR",
    "IT", "ES", "NL", "PL", "UA", "PK", "BD", "VN", "TH", "AR",
  ].map((code) => ({ code }));
}

type Props = { params: Promise<{ code: string }> };

export default async function CountryOG({ params }: Props) {
  const { code } = await params;
  const country = findCountry(code.toUpperCase());
  if (!country) {
    return new Response("not found", { status: 404 });
  }

  const fileNo = String(
    COUNTRIES.findIndex((c) => c.code === country.code) + 1,
  ).padStart(3, "0");
  const fontSize =
    country.name.length > 18 ? 96 : country.name.length > 12 ? 116 : 140;

  // Voice count for a richer OG card. Cheap query — limit 200 — and the
  // result gets cached server-side via revalidate on the upstream fetcher.
  const voiceRows = hasSupabase()
    ? await fetchByCountry(country.code, 200)
    : [];
  const voiceCount = voiceRows.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: "#f1ece2",
          color: "#0a0908",
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
            color: "rgba(10,9,8,0.65)",
            fontFamily: "monospace",
            paddingBottom: 14,
            borderBottom: "1px solid rgba(10,9,8,0.18)",
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
            {`vol. I · dossier ${fileNo} · ${country.code}`}
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 14,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(10,9,8,0.55)",
            fontFamily: "monospace",
            display: "flex",
          }}
        >
          {`§ dossier ${fileNo} — ${country.name.toLowerCase()}`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 18,
            fontStyle: "italic",
            fontSize,
            lineHeight: 0.95,
            letterSpacing: -1,
          }}
        >
          <div style={{ display: "flex" }}>What is</div>
          <div style={{ display: "flex", fontStyle: "normal" }}>
            {country.name}
          </div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#c7321b" }}>concerned about</span>
            <span style={{ color: "#0a0908" }}>?</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(10,9,8,0.7)",
            paddingTop: 16,
            borderTop: "1px solid rgba(10,9,8,0.18)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "rgba(10,9,8,0.5)" }}>
              an anonymous global record
            </span>
            <span style={{ fontSize: 22, color: "#0a0908" }}>
              whatisyourconcern.com
            </span>
          </div>
          {voiceCount > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <span style={{ color: "rgba(10,9,8,0.5)" }}>voices on the record</span>
              <span
                style={{
                  fontFamily: "serif",
                  fontStyle: "italic",
                  fontSize: 36,
                  color: "#c7321b",
                  letterSpacing: -0.3,
                }}
              >
                {voiceCount.toLocaleString()}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 20 }}>
              <span>press</span>
              <span style={{ color: "#c7321b" }}>·</span>
              <span>reddit</span>
              <span style={{ color: "#c7321b" }}>·</span>
              <span>anon dispatch</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
