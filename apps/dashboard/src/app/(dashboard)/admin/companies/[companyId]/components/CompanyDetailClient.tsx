'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BranchCard } from './BranchCard';
import { CreateBranchDialog } from './CreateBranchDialog';
import { type Company } from '@/data/services/companies.api';
import { type CompanyBranch } from '@/data/services/company-branches.api';

interface CompanyDetailClientProps {
  company: Company;
  branches: CompanyBranch[];
}

export function CompanyDetailClient({ company, branches }: CompanyDetailClientProps) {
  const router = useRouter();
  const t = useTranslations('companies');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground mt-1">{t('branchesSubtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('newBranch')}
        </Button>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noBranches')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
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
