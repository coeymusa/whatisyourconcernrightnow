import { ImageResponse } from "next/og";

export const runtime = "edge";

// 1024x1024 social-avatar PNG. Same composition as the favicon
// (red concern-dot inside a faint planet ring on ink), upsized for
// Twitter / X / LinkedIn / etc. Hit /avatar in the browser and save.
export async function GET() {
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
        {/* outer atmospheric halo */}
        <div
          style={{
            position: "absolute",
            width: 880,
            height: 880,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(199,50,27,0.18) 0%, rgba(199,50,27,0) 60%)",
          }}
        />
        {/* planet outline */}
        <div
          style={{
            position: "absolute",
            width: 760,
            height: 760,
            borderRadius: 9999,
            border: "8px solid rgba(250,246,237,0.32)",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        {/* concern-dot, upper-right of the planet (matches favicon) */}
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 600,
            width: 200,
            height: 200,
            borderRadius: 9999,
            background: "#c7321b",
            boxShadow: "0 0 60px rgba(199,50,27,0.55)",
          }}
        />
      </div>
    ),
    { width: 1024, height: 1024 },
  );
}
