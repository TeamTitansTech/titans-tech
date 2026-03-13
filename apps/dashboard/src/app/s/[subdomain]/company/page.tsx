import { getCompanyPublicInfo } from '@/data/services/companies.api';
import { getAllBranches } from '@/data/services/company-branches.api';
import { getMachinesByBranch } from '@/data/services/machines.api';
import { CompanyViewWrapper } from './components/CompanyViewWrapper';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { subdomain } = await params;

  // Fetch company details using the subdomain
  const companyResult = await getCompanyPublicInfo({ companySlug: subdomain });

  if (!companyResult.data) {
    const t = await getTranslations('companies');
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">{t('companyNotFound')}</div>
      </div>
    );
  }

  // Fetch all branches for this company
  const branchesResult = await getAllBranches({ companyId: companyResult.data.id });
  const branches = branchesResult.data || [];

  // Fetch machine counts for each branch
  const branchesWithMachineCount = await Promise.all(
    branches.map(async (branch) => {
      const machinesResult = await getMachinesByBranch(branch.id);
      return {
        ...branch,
        machineCount: machinesResult.data?.length || 0,
        machines: machinesResult.data || [],
      };
    }),
  );

  return <CompanyViewWrapper company={companyResult.data} branches={branchesWithMachineCount} />;
}
