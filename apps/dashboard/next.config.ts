import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
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
      // Production domains
      {
        protocol: 'https',
        hostname: 'titans-tech.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.titans-tech.com',
        pathname: '/**',
      },
    ],
  },

  // Ensure Prisma client is handled correctly by webpack
  serverExternalPackages: ['@prisma/client', '@titans-tech/db'],

  // Optimize for production
  poweredByHeader: false,
  compress: true,

  // Environment variables to be available in the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client', '@titans-tech/db');
    }
    return config;
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['@radix-ui/react-icons', '@titans-tech/ui'],
  },
};

export default withNextIntl(nextConfig);
