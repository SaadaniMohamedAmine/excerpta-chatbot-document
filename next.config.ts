import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
