import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Transpile shared workspace packages so Next.js can process their TypeScript
  transpilePackages: ['@projecthub/ui', '@projecthub/types', '@projecthub/utils'],

  // Strict mode catches common React bugs during development
  reactStrictMode: true,

  // Output source maps in production for better error tracking
  productionBrowserSourceMaps: false,

  // Image optimization domains will be added per milestone as needed
  images: {
    remotePatterns: [],
  },

  // Security headers added in Phase 15 (deployment)
}

export default nextConfig
