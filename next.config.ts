import type { NextConfig } from "next";
import { config } from 'dotenv';
import withPWA from "@ducanh2912/next-pwa";

// Load environment variables from .env.local
config({ path: '.env.local' });

const nextConfig: NextConfig = {
  // Empty turbopack config for Next.js 16
  turbopack: {},

  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Add all quality values we use
    qualities: [70, 75, 80, 85, 90, 95, 100],
  },
  // Exclude backup directories from build
  outputFileTracingExcludes: {
    '*': ['./backup-before-migration/**/*'],
  },
};

// PWA Configuration
export default withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  sw: "service-worker.js",
})(nextConfig);
