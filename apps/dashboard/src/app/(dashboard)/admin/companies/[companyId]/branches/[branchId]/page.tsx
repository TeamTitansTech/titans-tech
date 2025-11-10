import { getTranslations } from 'next-intl/server';
import { BranchDetailClient } from './components/BranchDetailClient';
import { getBranch } from '@/data/services/company-branches.api';
import { getMachinesByBranch } from '@/data/services/machines.api';

interface BranchDetailPageProps {
  params: Promise<{
    companyId: string;
    branchId: string;
  }>;
}

export default async function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { companyId, branchId } = await params;
  const t = await getTranslations('branches');

  const [branchResponse, machinesResponse] = await Promise.all([
    getBranch({ branchId }),
    getMachinesByBranch(branchId),
  ]);

  if (branchResponse.errors || !branchResponse.data) {
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('branchNotFound')}</h1>
        </div>
      </div>
    );
  }

  const branch = branchResponse.data;
  const machines = machinesResponse.data || [];

  return <BranchDetailClient branch={branch} machines={machines} companyId={companyId} />;
}
