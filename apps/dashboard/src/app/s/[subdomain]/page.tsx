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
      icons: '/titans-tech.png',
    };
  }

  return {
    title: subdomainResult.data.name,
    description: `${subdomainResult.data.name} - Industrial Management & Inspection Platform`,
    icons: subdomainResult.data.logo || '/titans-tech.png',
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const authToken = await getCookie('auth_token');
  const { redirect: redirectTo } = await searchParams;

  if (authToken) {
    redirect(redirectTo || '/home');
  }

  const { subdomain } = await params;
  const subdomainResult = await getCompanyPublicInfo({ companySlug: subdomain ?? '' });
  if (!subdomainResult.data) {
    return <div>Company not found ://///</div>;
  }
  const brandColor = subdomainResult.data.brandColor;

  return (
    <div
      style={
        brandColor ? ({ '--login-brand-color': brandColor } as React.CSSProperties) : undefined
      }
    >
      <LoginForm
        companyId={subdomainResult.data.id}
        brandTitle={subdomainResult.data.name}
        brandSubtitle="Industrial Management & Inspection Platform"
        brandColor={brandColor}
        brandLogo={subdomainResult.data.loginLogo}
        loginType="client"
        redirectTo={redirectTo}
      />
    </div>
  );
}
