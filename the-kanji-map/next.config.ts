import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds, not dev mode
  // Mounted at /kanjimap in the combined deploy. Override with
  // KANJI_BASE_PATH for hosts that serve under a subpath (e.g. GitHub Pages).
  basePath: process.env.KANJI_BASE_PATH || "/kanjimap",
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
};

export default nextConfig;
