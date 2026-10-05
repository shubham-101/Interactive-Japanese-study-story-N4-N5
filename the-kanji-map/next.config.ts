import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds, not dev mode
  // Mounted at /kanjimap in the combined deploy.
  basePath: "/kanjimap",
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
};

export default nextConfig;
