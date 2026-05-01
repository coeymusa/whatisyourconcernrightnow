import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <div
          style={{
            position: "absolute",
            width: 138,
            height: 138,
            borderRadius: 9999,
            border: "5px solid rgba(250,246,237,0.32)",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 38,
            left: 96,
            width: 50,
            height: 50,
            borderRadius: 9999,
            background: "#c7321b",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
