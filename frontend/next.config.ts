// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Next.js 16+ configuration with OpenAI ChatKit support

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

  // Use Turbopack with empty config (SVG support is built-in)
  turbopack: {},
};

export default nextConfig;
