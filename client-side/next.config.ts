import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'supa.halvooo.com',
      },
    ],
  },

};

export default nextConfig;
