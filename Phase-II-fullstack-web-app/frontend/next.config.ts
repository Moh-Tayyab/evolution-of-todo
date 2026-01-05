// @spec: specs/002-fullstack-web-app/plan.md
// Next.js 16+ configuration

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Turbopack from bundling better-auth (causes crashes)
  serverExternalPackages: ["better-auth"],
};

export default nextConfig;
