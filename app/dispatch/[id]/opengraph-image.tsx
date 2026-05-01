import { ImageResponse } from "next/og";
import { findCountry } from "../../lib/countries";
import { fetchConcernById, hasSupabase } from "../../lib/supabase";
import { CATEGORY_LABELS, type ConcernCategory } from "../../lib/types";

export const alt = "what is your concern? — anon dispatch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function DispatchOG({ params }: Props) {
  const { id } = await params;
  if (!hasSupabase()) {
    return new Response("not found", { status: 404 });
  }
  const r = await fetchConcernById(id);
  if (!r) {
    return new Response("not found", { status: 404 });
  }
  const country = findCountry(r.country_code);
  const text = r.text;
  // Adapt font size to text length so the quote fits on one card.
  const fontSize =
    text.length > 200 ? 36 : text.length > 140 ? 44 : text.length > 80 ? 56 : 72;

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
            {`anon dispatch · ${country?.name ?? r.country_code}`}
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
          {`§ ${country?.name.toLowerCase() ?? r.country_code} · ages ${r.bracket} · ${CATEGORY_LABELS[r.category as ConcernCategory].toLowerCase()}`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            fontStyle: "italic",
            fontSize,
            lineHeight: 1.1,
            letterSpacing: -0.5,
            color: "#faf6ed",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", color: "#c7321b" }}>"</div>
          <div style={{ display: "flex", marginTop: -8 }}>{text}</div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-end",
              color: "#c7321b",
              marginTop: -8,
            }}
          >
            "
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(250,246,237,0.7)",
            paddingTop: 16,
            borderTop: "1px solid rgba(250,246,237,0.2)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "rgba(250,246,237,0.5)" }}>
              an anonymous global record
            </span>
            <span style={{ fontSize: 22, color: "#faf6ed" }}>
              whatisyourconcern.com
            </span>
          </div>
          <div style={{ display: "flex" }}>
            {`vol. I · ${r.id.slice(-6)}`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
