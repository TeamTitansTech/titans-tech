import { AppLayout } from '@/components/layout/AppLayout';
import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { Metadata } from 'next';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { subdomain } = await params;
  const companyResult = await getCompanyPublicInfo({ companySlug: subdomain });

  if (!companyResult.data) {
    return {};
  }

  return {
    title: `${companyResult.data.name} | Titans Tech`,
    icons: companyResult.data.logo || '/titans-tech.png',
  };
}

export default function DashboardLayout({ children }: LayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}
