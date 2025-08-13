// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "neu.christians.photo.christians.photo",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
