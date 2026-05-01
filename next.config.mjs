/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["motion", "d3-geo", "topojson-client"],
  },
  async headers() {
    return [
      {
        // Preload the topojson on the homepage so the browser starts the
        // fetch in parallel with HTML parsing — Globe's useEffect then
        // hits the cache instead of waiting on a round-trip.
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
        // Topojson is hashed/static; cache forever.
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
