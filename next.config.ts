import type { NextConfig } from "next";

// Pins the project root explicitly — without this, Next.js walks up looking
// for a lockfile and can lock onto an unrelated one outside the repo
// (e.g. a stray package-lock.json in the user's home directory), which
// throws off both Turbopack module resolution and Vercel's output tracing.
const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  // pdf-parse/mammoth do Node-specific file/buffer work that breaks if bundled
  // into the serverless function — keep them as real external requires.
  serverExternalPackages: ["pdf-parse", "mammoth"],
  images: {
    remotePatterns: [
      // Google OAuth profile pictures
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub OAuth profile pictures
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
