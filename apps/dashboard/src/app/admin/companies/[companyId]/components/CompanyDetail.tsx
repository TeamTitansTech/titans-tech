'use client';

import { useState, useOptimistic } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BranchCard } from './BranchCard';
import { CreateBranchDialog } from './CreateBranchDialog';
import { type Company } from '@/data/services/companies.api';
import { type CompanyBranch } from '@/data/services/company-branches.api';

interface CompanyDetailProps {
  company: Company;
  branches: CompanyBranch[];
}

export function CompanyDetail({ company, branches }: CompanyDetailProps) {
  const router = useInternalRouter();
  const t = useTranslations('companies');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [optimisticBranches, addOptimisticBranch] = useOptimistic(
    branches,
    (state, newBranch: CompanyBranch) => [...state, newBranch],
  );

  const handleSuccess = (newBranch?: CompanyBranch) => {
    if (newBranch) {
      addOptimisticBranch(newBranch);
    }
    router.refresh();
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/companies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground mt-1">{t('branchesSubtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="create-branch-button">
          <Plus className="w-4 h-4 mr-2" />
          {t('newBranch')}
        </Button>
      </div>

      {optimisticBranches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noBranches')}</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="branches-grid"
        >
          {optimisticBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} companyId={company.id} />
          ))}
        </div>
      )}

      <CreateBranchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
        companyId={company.id}
      />
    </div>
  );
}
