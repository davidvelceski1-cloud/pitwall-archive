import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The archive is read from data/generated at build and revalidation time.
  outputFileTracingIncludes: {
    "/**": ["./data/generated/**/*"],
  },
};

export default nextConfig;
