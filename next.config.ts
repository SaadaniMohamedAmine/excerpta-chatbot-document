import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Pins the project root explicitly — without this, Next.js walks up looking
// for a lockfile and can lock onto an unrelated one outside the repo
// (e.g. a stray package-lock.json in the user's home directory), which
// throws off both Turbopack module resolution and Vercel's output tracing.
const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  // Default bottom-left position overlaps the app shell's sidebar profile
  // block (dev-only, never ships to prod) — move it out of the way.
  devIndicators: {
    position: "top-right",
  },
  turbopack: {
    root: __dirname,
  },
  // pdf-parse/mammoth do Node-specific file/buffer work that breaks if bundled
  // into the serverless function — keep them as real external requires.
  // @napi-rs/canvas is a native-binary package pdfjs-dist (pdf-parse's engine)
  // requires conditionally at runtime, not via a static import anywhere in our
  // own source — Next's file-tracing can't see that dynamic require to know
  // it needs copying into the deployed function, which is exactly why it was
  // missing in production ("Cannot find module '@napi-rs/canvas'") even
  // though it installs and builds fine locally. Marking it external here is
  // what tells Next's tracer to include its files as it does for pdf-parse.
  serverExternalPackages: ["pdf-parse", "mammoth", "@napi-rs/canvas"],
  // serverExternalPackages alone controls BUNDLING (don't inline it into the
  // route's JS chunk) — it does NOT guarantee the package's files are
  // physically copied into the deployed function's node_modules, which is a
  // separate step (Next's own output-file-tracing docs list this exact
  // native-binary-package situation, e.g. sharp, as needing
  // outputFileTracingIncludes too). Without this, @napi-rs/canvas kept being
  // "Cannot find module" in prod even after being marked external.
  // Only pdfjs-dist's own entry file (legacy/build/pdf.mjs) was being traced,
  // not the rest of the package — pdf.mjs loads pdf.worker.mjs (its PDF.js
  // "worker") via a dynamic path at runtime, which the tracer can't follow
  // either, so it was missing the same way @napi-rs/canvas was.
  outputFileTracingIncludes: {
    "/api/workflows/process-document": ["./node_modules/@napi-rs/**/*", "./node_modules/pdfjs-dist/**/*"],
  },
  images: {
    remotePatterns: [
      // Google OAuth profile pictures
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub OAuth profile pictures
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
