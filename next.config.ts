import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Arabic is the default language.
  redirects: async () => [{ source: "/", destination: "/ar", permanent: false }],
};

export default nextConfig;
