import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0908",
          color: "#c7321b",
          fontFamily: "serif",
          fontStyle: "italic",
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: -2,
          paddingBottom: 4,
        }}
      >
        ?
      </div>
    ),
    { ...size },
  );
}
