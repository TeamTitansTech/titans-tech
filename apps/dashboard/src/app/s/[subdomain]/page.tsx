import { LoginForm } from '@/components/auth/LoginForm';
import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { rootDomain } from '@/lib/utils';
import { getCookie } from '@/lib/cookies';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ subdomain?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;

  const subdomainResult = await getCompanyPublicInfo({ companySlug: subdomain ?? '' });

  if (!subdomainResult.data) {
    return {
      title: rootDomain,
      icons: '/titans-tech.png',
    };
  }

  return {
    title: subdomainResult.data.name,
    description: `${subdomainResult.data.name} - Industrial Management & Inspection Platform`,
    icons: subdomainResult.data.logo || '/titans-tech.png',
  };
}

export default async function Page({ params }: PageProps) {
  const authToken = await getCookie('auth_token');

  if (authToken) {
    redirect('/home');
  }

  const { subdomain } = await params;
  const subdomainResult = await getCompanyPublicInfo({ companySlug: subdomain ?? '' });
  if (!subdomainResult.data) {
    return <div>Company not found</div>;
  }
  return (
    <LoginForm
      companyId={subdomainResult.data.id}
      brandTitle={subdomainResult.data.name}
      brandSubtitle="Industrial Management & Inspection Platform"
      loginType="client"
    />
  );
}
