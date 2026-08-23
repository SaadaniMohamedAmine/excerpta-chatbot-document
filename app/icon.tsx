// app/icon.tsx
import { ImageResponse } from "next/og";

// No explicit runtime — "edge" is deprecated as of Next.js 16 in favor of
// the default "nodejs" runtime, which ImageResponse works with just fine.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1E3A8A",
          borderRadius: 6,
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        E
      </div>
    ),
    { ...size }
  );
}
