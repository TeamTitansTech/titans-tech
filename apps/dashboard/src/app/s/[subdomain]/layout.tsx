import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { Metadata } from 'next';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: DashboardLayoutProps): Promise<Metadata> {
  const { subdomain } = await params;
  const companyResult = await getCompanyPublicInfo({ companySlug: subdomain });

  if (!companyResult.data) {
    return {
      title: 'Titans Tech',
      icons: '/titans-tech.png',
    };
  }

  return {
    title: `${companyResult.data.name} | Titans Tech`,
    icons: companyResult.data.logo || companyResult.data.loginLogo || '/titans-tech.png',
  };
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
