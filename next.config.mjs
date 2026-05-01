/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["motion", "d3-geo", "topojson-client"],
  },
  async headers() {
    return [
      {
        // Preload the topojson on the homepage and embed so the browser
        // starts the fetch in parallel with HTML parsing — Globe's
        // useEffect then hits the cache instead of waiting on a round-trip.
        // ~800ms LCP win on slow mobile.
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              "</world-110m.json>; rel=preload; as=fetch; crossorigin=anonymous",
          },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Link",
            value:
              "</world-110m.json>; rel=preload; as=fetch; crossorigin=anonymous",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
      {
        // The topojson is content-hashed in /public; let it cache for a year.
        source: "/world-110m.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
