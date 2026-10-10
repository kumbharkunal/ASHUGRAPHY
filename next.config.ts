import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/**
 * This machine's network addresses. The dev server only serves its scripts to localhost unless
 * other hostnames are allowed, so without this a phone opening http://<this machine's IP>:3000
 * gets the page with no JavaScript: no nav, no animations. Development only; it has no effect on
 * production builds.
 */
function lanHosts(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((net) => net !== undefined && net.family === "IPv4" && !net.internal)
    .map((net) => net!.address);
}

/**
 * Demo mode keeps the site out of search indexes until the client approves it.
 * It is on unless NEXT_PUBLIC_DEMO_MODE is explicitly "false".
 */
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Everything the site loads is first-party (fonts, images, scripts, Speed Insights on Vercel).
 * Inline scripts and styles stay allowed because the page is fully static (no per-request nonce):
 * Next's bootstrap, the no-flash head script and JSON-LD are inline. Development needs eval for
 * fast refresh, so the policy is production only.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(isProduction ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
  ...(isDemo ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: lanHosts(),
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
