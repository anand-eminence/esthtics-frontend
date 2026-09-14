import type { NextConfig } from "next";

const apiOrigin = (process.env.API_BASE_URL || "http://localhost:4001").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      { source: "/quiz", destination: "/quiz/index.html" },

      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: "/quiz/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
