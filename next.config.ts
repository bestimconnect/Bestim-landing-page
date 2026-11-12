import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dashboard uploads: three 2 MB pictures in one form, or one 10 MB team file (default limit is 1 MB).
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  // Arabic is the default language.
  redirects: async () => [
    { source: "/", destination: "/ar", permanent: false },
    // Shared-vehicle links have no language in them. Next.js keeps the ?token=… part.
    { source: "/receive", destination: "/ar/receive", permanent: false },
  ],
};

export default nextConfig;
