import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
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
            width: 26,
            height: 26,
            borderRadius: 9999,
            border: "1px solid rgba(250,246,237,0.32)",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        {/* concern dot — slightly upper-right so it reads like a signal on a globe */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 17,
            width: 9,
            height: 9,
            borderRadius: 9999,
            background: "#c7321b",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
