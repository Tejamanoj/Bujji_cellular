import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow production builds to succeed even with TS errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Suppress ESLint errors from blocking builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fix turbopack root detection warning
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
