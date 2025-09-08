import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  devIndicators: false,
  images: {
    domains: ['https://rphuxxyxdtqburtlfatf.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rphuxxyxdtqburtlfatf.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
