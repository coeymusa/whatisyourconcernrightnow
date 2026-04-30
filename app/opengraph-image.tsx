import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "what is your concern, right now?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
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
        {/* top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 16,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(250,246,237,0.6)",
            fontFamily: "monospace",
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
            <span>live · global record</span>
          </div>
          <div>vol. I · anon dispatch</div>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 80,
            fontStyle: "italic",
            fontSize: 132,
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          <span>what is your</span>
          <span>
            concern,{" "}
            <span style={{ color: "#c7321b", fontStyle: "italic" }}>
              right now
            </span>
            ?
          </span>
        </div>

        {/* footer */}
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(250,246,237,0.7)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "rgba(250,246,237,0.5)" }}>add your voice</span>
            <span style={{ fontSize: 22, color: "#faf6ed" }}>
              whatisyourconcernrightnow.com
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>anonymous</span>
            <span style={{ color: "#c7321b" }}>·</span>
            <span>permanent</span>
            <span style={{ color: "#c7321b" }}>·</span>
            <span>global</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
