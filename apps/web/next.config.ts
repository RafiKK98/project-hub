import type { NextConfig } from "next";

const isDev = process.env["NODE_ENV"] !== "production";

// ── Security headers ──────────────────────────────────────────────────────────
// Applied to every response. Adjust CSP if you add third-party scripts.
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // Conservative CSP — tighten further for production by removing 'unsafe-inline'
    // once you have a nonce-based approach or CSS-in-JS is not in use.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      // In development, allow HTTP localhost for API calls.
      // In production, only HTTPS is permitted.
      isDev
        ? "connect-src 'self' http://localhost:* ws://localhost:*"
        : "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: [
    "@projecthub/ui",
    "@projecthub/types",
    "@projecthub/utils",
  ],

  reactStrictMode: true,

  // Disable source maps in production to avoid leaking source code
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      // Add your avatar/image CDN domains here when needed
      // { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect root to dashboard
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
