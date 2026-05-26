import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimized for Vercel deployment
  serverExternalPackages: ['pdf-parse', 'firebase-admin'],
  experimental: {
    // Enable Web Vitals attribution for better debugging
    webVitalsAttribution: ['CLS', 'LCP']
  },
  // Optimize images for production
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // PoweredBy header removal for security
  poweredByHeader: false,
};

export default nextConfig;
