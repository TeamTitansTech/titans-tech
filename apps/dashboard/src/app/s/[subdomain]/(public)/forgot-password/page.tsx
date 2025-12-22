import { getCompanyPublicInfo } from '@/data/services/companies.api';
import ForgotPasswordForm from './ForgotPasswordForm';

interface ForgotPasswordPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { subdomain } = await params;

  const companyResult = await getCompanyPublicInfo({ companySlug: subdomain });

  if (!companyResult.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Company not found</h1>
        </div>
      </div>
    );
  }

  return <ForgotPasswordForm companyId={companyResult.data.id} subdomain={subdomain} />;
}
