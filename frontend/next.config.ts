import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // Removed as Render Node runtime doesn't automatically serve public/.next/static in this mode without manual copies
};

export default nextConfig;
