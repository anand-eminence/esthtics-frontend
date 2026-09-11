import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    // The member quiz is plain static files in public/quiz. Next serves those
    // at their exact path, so /quiz on its own would 404 — this makes the
    // shorter URL work, since that is what goes into the Circle embed.
    return [{ source: "/quiz", destination: "/quiz/index.html" }];
  },

  async headers() {
    return [
      {
        // Circle renders the quiz inside an iframe, so it must not be
        // same-origin framed only. It is public content with no session.
        source: "/quiz/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
