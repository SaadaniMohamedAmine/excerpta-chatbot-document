// app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://excerpta-chatbot-document.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Real authenticated routes for this app (the (app) route group
        // segment itself is stripped from the actual URL by Next.js, so it
        // has no matching disallow entry — these are the resolved paths).
        disallow: ["/api/", "/documents", "/collections", "/settings"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
