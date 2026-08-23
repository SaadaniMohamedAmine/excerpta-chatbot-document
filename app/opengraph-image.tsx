// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

// No explicit runtime — "edge" is deprecated as of Next.js 16 in favor of
// the default "nodejs" runtime, which ImageResponse works with just fine.
export const alt = "Excerpta — Chat with any document, cited to the page.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getSourceSerifBold(): Promise<ArrayBuffer | null> {
  try {
    const cssUrl =
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&display=swap";
    const css = await (
      await fetch(cssUrl, {
        headers: {
          // An old-Chrome UA makes Google's font CSS endpoint return a ttf
          // src instead of woff2 — Satori (which powers next/og's
          // ImageResponse) can only parse ttf/otf/woff, not woff2.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
        },
      })
    ).text();

    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;

    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const serifBold = await getSourceSerifBold();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#F8FAFC",
          // If the Google Fonts ttf fetch above failed, serifBold is null
          // and no "Source Serif 4" font is registered with ImageResponse —
          // this fontFamily then falls back to a system serif. The image
          // still renders correctly, just without the exact custom typeface.
          fontFamily: serifBold ? "Source Serif 4" : "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#1E3A8A",
            display: "flex",
          }}
        >
          Excerpta
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#475569",
            fontFamily: "sans-serif",
            display: "flex",
            maxWidth: 900,
          }}
        >
          AI document chat that cites its sources, down to the page.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "6px 16px",
              borderRadius: 999,
              backgroundColor: "#D4A537",
              color: "#0F172A",
              fontSize: 20,
              fontFamily: "sans-serif",
              fontWeight: 600,
            }}
          >
            p. 4
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#475569", fontFamily: "sans-serif" }}>
            Every answer cited to the page
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serifBold
        ? [{ name: "Source Serif 4", data: serifBold, style: "normal", weight: 700 }]
        : undefined,
    }
  );
}
