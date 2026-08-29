import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tanmayvedpathak.github.io",
        pathname: "/interview-notes/img/**",
      },
    ],
  },
};

export default nextConfig;
