import { getTranslations } from 'next-intl/server';
import { CompanyDetailClient } from './components/CompanyDetailClient';
import { getCompany } from '@/data/services/companies.api';
import { getAllBranches } from '@/data/services/company-branches.api';

interface CompanyDetailPageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { companyId } = await params;
  const t = await getTranslations('companies');

  const [companyResponse, branchesResponse] = await Promise.all([
    getCompany({ companyId }),
    getAllBranches({ companyId }),
  ]);

  if (companyResponse.errors || !companyResponse.data) {
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('companyNotFound')}</h1>
        </div>
      </div>
    );
  }

  const company = companyResponse.data;
  const branches = branchesResponse.data || [];

  return <CompanyDetailClient company={company} branches={branches} />;
}
