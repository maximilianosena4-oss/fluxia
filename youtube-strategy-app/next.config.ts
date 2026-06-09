import type { NextConfig } from "next";

// Orígenes permitidos en producción — brief sección 7.5
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "media-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control",   value: "on" },
];

const corsHeaders = (origin: string) => [
  { key: "Access-Control-Allow-Origin",      value: origin },
  { key: "Access-Control-Allow-Methods",     value: "GET, POST, PATCH, DELETE, OPTIONS" },
  { key: "Access-Control-Allow-Headers",     value: "Content-Type, Authorization" },
  { key: "Access-Control-Allow-Credentials", value: "true" },
];

const nextConfig: NextConfig = {
  async headers() {
    const apiCorsRules = ALLOWED_ORIGINS.map((origin) => ({
      source: "/api/(.*)",
      headers: corsHeaders(origin),
    }));

    return [
      // Security headers en todas las rutas
      { source: "/(.*)", headers: securityHeaders },
      // CORS solo en rutas API — orígenes whitelist
      ...apiCorsRules,
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
