import { ImageResponse } from "next/og";

export const runtime = "edge";
// Google's favicon guidelines require a multiple of 48px
// (48×48, 96×96, 144×144...). 32×32 gets dropped in search results
// and replaced with the generic globe.
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

// A faint planet outline holding a single bright concern-dot.
// No text, so nothing can ever be misaligned or font-substituted.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0908",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* planet outline */}
        <div
          style={{
            position: "absolute",
            width: 78,
            height: 78,
            borderRadius: 9999,
            border: "3px solid rgba(250,246,237,0.32)",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        {/* concern dot — slightly upper-right so it reads like a signal on a globe */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 51,
            width: 27,
            height: 27,
            borderRadius: 9999,
            background: "#c7321b",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
