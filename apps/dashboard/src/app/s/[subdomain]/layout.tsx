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

  // Prepare company info for injection into the page
  const companyInfoScript = initialCompanyInfo
    ? `window.__COMPANY_INFO__ = ${JSON.stringify({
        logo: initialCompanyInfo.logo,
        name: initialCompanyInfo.name,
      })};`
    : '';

  return (
    <ThemeProvider subdomain={subdomain} initialCompanyInfo={initialCompanyInfo}>
      {/* Inject company info for immediate access during loading */}
      {companyInfoScript && <script dangerouslySetInnerHTML={{ __html: companyInfoScript }} />}
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  );
}
