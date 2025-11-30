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

  // Fetch company info server-side to prevent color flickering and provide logo
  const companyResult = await getCompanyPublicInfo({ companySlug: subdomain });
  const initialCompanyInfo = companyResult.data || null;

  return (
    <ThemeProvider subdomain={subdomain} initialCompanyInfo={initialCompanyInfo}>
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  );
}
