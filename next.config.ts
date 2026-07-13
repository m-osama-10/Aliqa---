import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor (mobile app) + Vercel (web)
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  trailingSlash: true,
};

export default nextConfig;
