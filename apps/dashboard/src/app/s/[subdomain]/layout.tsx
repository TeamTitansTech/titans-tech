import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { subdomain } = await params;

  // Fetch company info server-side to prevent color flickering
  const companyResult = await getCompanyPublicInfo({ companySlug: subdomain });
  const initialColors = companyResult.data
    ? {
        brandColor: companyResult.data.brandColor || undefined,
        accentColor: companyResult.data.accentColor || undefined,
      }
    : undefined;

  return (
    <ThemeProvider subdomain={subdomain} initialColors={initialColors}>
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  );
}
