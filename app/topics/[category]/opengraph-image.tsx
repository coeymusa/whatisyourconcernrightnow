import { ImageResponse } from "next/og";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ConcernCategory } from "../../lib/types";

// Runs on Node.js — Edge runtime conflicts with generateStaticParams.
export const alt = "what is your concern? — topic dossier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return CATEGORY_ORDER.filter((c) => c !== "other").map((category) => ({
    category,
  }));
}

type Props = { params: Promise<{ category: string }> };

function isCategory(s: string): s is ConcernCategory {
  return (CATEGORY_ORDER as string[]).includes(s);
}

export default async function TopicOG({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category) || category === "other") {
    return new Response("not found", { status: 404 });
  }

  const label = CATEGORY_LABELS[category];
  const list = CATEGORY_ORDER.filter((c) => c !== "other");
  const fileNo = String(list.indexOf(category) + 1).padStart(2, "0");
  const fontSize = label.length > 22 ? 92 : label.length > 16 ? 108 : 128;

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
            {`vol. I · topic ${fileNo} · ${category}`}
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
          {`§ topic ${fileNo} — ${category}`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            fontStyle: "italic",
            fontSize,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          <div style={{ display: "flex" }}>What the world</div>
          <div style={{ display: "flex" }}>is saying about</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#c7321b" }}>{label.toLowerCase()}</span>
            <span style={{ color: "#0a0908" }}>.</span>
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
          <div style={{ display: "flex", gap: 20 }}>
            <span>press</span>
            <span style={{ color: "#c7321b" }}>·</span>
            <span>reddit</span>
            <span style={{ color: "#c7321b" }}>·</span>
            <span>hn</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
