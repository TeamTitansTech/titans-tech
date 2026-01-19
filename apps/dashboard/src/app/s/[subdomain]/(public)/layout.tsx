import { ThemeProvider } from '@/contexts/ThemeContext';
import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { Metadata } from 'next';
import { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PublicLayoutProps): Promise<Metadata> {
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

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { subdomain } = await params;

  // Fetch company info server-side for theming
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
      {/* No AppLayout wrapper for public pages */}
      {children}
    </ThemeProvider>
  );
}
