import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "*.talkrai.app" },
      { protocol: "https", hostname: "ffzaplhizzoljnfkdqdd.supabase.co" },
    ],
  },
};

export default nextConfig;
