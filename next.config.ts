import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is for Docker/VPS hosting. Vercel handles output automatically.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  transpilePackages: ['socket.io-client'],
};

export default nextConfig;
