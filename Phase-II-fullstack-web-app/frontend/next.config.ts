// @spec: specs/002-fullstack-web-app/plan.md
// Next.js 16+ configuration

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // External packages that should not be bundled
  serverExternalPackages: ["better-auth"],

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
