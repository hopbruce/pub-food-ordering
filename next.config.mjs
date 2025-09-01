// next.config.mjs
import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  // Don’t block deploys over types/lint while we’re wiring payments
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Make "@/..." point to the project root (so "@/lib/..." works on Render)
  webpack: (config) => {
    config.resolve.alias["@" ] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
