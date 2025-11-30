'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { ReactNode } from 'react';

// Type for global company info injected by layout
declare global {
  interface Window {
    __COMPANY_INFO__?: {
      logo?: string | null;
      name?: string | null;
    };
  }
}

// Helper to get company info from global variable (works on client)
function getGlobalCompanyInfo() {
  if (typeof window !== 'undefined' && window.__COMPANY_INFO__) {
    return window.__COMPANY_INFO__;
  }
  return null;
}

interface BrandedSkeletonProps {
  children: ReactNode;
}

export function BrandedSkeleton({ children }: BrandedSkeletonProps) {
  const { companyInfo } = useTheme();

  // Get from global as fallback (synchronous read)
  const globalInfo = getGlobalCompanyInfo();

  // Use context first, then fall back to global
  const logo = companyInfo?.logo || globalInfo?.logo;
  const name = companyInfo?.name || globalInfo?.name;

  return (
    <div className="flex flex-col">
      {/* Company Logo Header */}
      {logo && (
        <div className="flex justify-center py-8">
          <div className="relative animate-pulse">
            <Image
              src={logo}
              alt={name || 'Company logo'}
              width={120}
              height={48}
              className="object-contain opacity-70"
              priority
            />
          </div>
        </div>
      )}

      {/* Skeleton Content */}
      {children}
    </div>
  );
}

interface BrandedLogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function BrandedLogoSpinner({ size = 'md', message }: BrandedLogoSpinnerProps) {
  const { companyInfo } = useTheme();
  const globalInfo = getGlobalCompanyInfo();

  const logo = companyInfo?.logo || globalInfo?.logo;
  const name = companyInfo?.name || globalInfo?.name;

  const sizeClasses = {
    sm: { width: 80, height: 32 },
    md: { width: 120, height: 48 },
    lg: { width: 160, height: 64 },
  };

  const dimensions = sizeClasses[size];

  if (!logo) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative animate-pulse">
        <Image
          src={logo}
          alt={name || 'Company logo'}
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
        />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
