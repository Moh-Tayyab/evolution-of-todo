// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Next.js 16+ configuration with OpenAI ChatKit support

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Transpile packages (resolves Better Auth + Zod v4 issue)
  transpilePackages: ['better-auth', 'zod'],

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

  // Experimental features for module resolution
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['zod', 'better-auth'],
  },
};

export default nextConfig;
