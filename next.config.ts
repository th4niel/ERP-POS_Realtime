import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  devIndicators: false,
  images: {
    domains: ['https://jcldztqohocobilufznj.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jcldztqohocobilufznj.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
