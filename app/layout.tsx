import type { Metadata } from "next";
import { geistSans, geistMono, sourceSerif } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/ui/page-loader";
import "@/styles/globals.css";

const SITE_URL = "https://excerpta-chatbot-document.vercel.app";
const DESCRIPTION = "AI document chat that cites its sources, down to the page.";

// Next.js automatically merges app/opengraph-image.tsx and app/icon.tsx into
// this metadata via file convention — no need to list them under
// openGraph.images manually.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Excerpta — Chat with any document, cited to the page",
    template: "%s — Excerpta",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Excerpta",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Excerpta",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excerpta",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PageLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
