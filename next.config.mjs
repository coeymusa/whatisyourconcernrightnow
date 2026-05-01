/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["motion", "d3-geo", "topojson-client"],
  },
  async headers() {
    return [
      {
        // Allow /embed/* to be iframed by any origin. Everything else
        // inherits Vercel/Next defaults (which permit same-origin only).
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
          // Some older browsers honor X-Frame-Options over CSP. Setting it
          // to ALLOWALL is non-standard but treated as "no restriction" by
          // most legacy browsers; modern browsers ignore it in favor of CSP.
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
