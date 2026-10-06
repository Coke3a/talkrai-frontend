import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served as static assets by Cloudflare Workers (see wrangler.jsonc); every page is client-rendered.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
