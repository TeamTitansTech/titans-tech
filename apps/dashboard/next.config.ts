import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.tenor.com',
      },
      // Allow localhost for subdomain image loading in development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Allow wildcard subdomains on localhost for development
      {
        protocol: 'http',
        hostname: '*.localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  // Ensure Prisma client is handled correctly by webpack
  serverExternalPackages: ['@prisma/client', '@titans-tech/db'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client', '@titans-tech/db');
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
