import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // output: 'standalone', // Disabled due to Turbopack + middleware bug in Next.js 16
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
      // Wikipedia for company logos
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      // AWS S3 bucket for blueprint and machine images
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
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
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withNextIntl(nextConfig);
