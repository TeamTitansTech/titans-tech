import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { rootDomain } from '@/lib/utils';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ subdomain?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;

  const subdomainResult = await getCompanyPublicInfo({ companySlug: subdomain ?? '' });

  if (!subdomainResult.data) {
    return {
      title: rootDomain,
    };
  }

  return {
    title: `${subdomainResult.data.name} Dashboard`,
    description: `${subdomainResult.data.name} Dashboard`,
    icons: subdomainResult.data.logo,
  };
}

export default async function Page({ params }: PageProps) {
  const { subdomain } = await params;
  const subdomainResult = await getCompanyPublicInfo({ companySlug: subdomain ?? '' });
  if (!subdomainResult.data) {
    return <div>Company not found</div>;
  }
  return <div> {subdomainResult.data.name} Dashboard</div>;
}
