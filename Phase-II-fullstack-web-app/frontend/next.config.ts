// @spec: specs/002-fullstack-web-app/plan.md
// Next.js 16+ configuration

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Turbopack from bundling better-auth (causes crashes)
  serverExternalPackages: ["better-auth"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
