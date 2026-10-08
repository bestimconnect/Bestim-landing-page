import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Arabic is the default language.
  redirects: async () => [
    { source: "/", destination: "/ar", permanent: false },
    // Shared-vehicle links have no language in them. Next.js keeps the ?token=… part.
    { source: "/receive", destination: "/ar/receive", permanent: false },
  ],
};

export default nextConfig;
