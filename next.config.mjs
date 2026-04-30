/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["motion", "d3-geo", "topojson-client"],
  },
};

export default nextConfig;
