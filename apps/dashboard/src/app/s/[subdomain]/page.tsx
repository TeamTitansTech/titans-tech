import { LoginForm } from '@/components/auth/LoginForm';
import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { rootDomain } from '@/lib/utils';
import { getCookie } from '@/lib/cookies';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ subdomain?: string }>;
  searchParams: Promise<{ redirect?: string }>;
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

export default async function Page({ params, searchParams }: PageProps) {
  const authToken = await getCookie('auth_token');
  const { redirect: redirectPath } = await searchParams;

  if (authToken) {
    redirect(redirectPath || '/home');
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
      redirectPath={redirectPath}
    />
  );
}
