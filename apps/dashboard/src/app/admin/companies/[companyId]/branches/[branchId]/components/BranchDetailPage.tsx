'use client';

import { useState } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCompanyLimits } from '@/hooks/useCompanyLimits';
import { BranchDetail } from './BranchDetail';
import { MachineCreationModal } from '@/app/admin/machines/components/MachineCreationModal';

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
  isMainBranch: boolean;
  companyId: string;
}

interface BranchDetailPageProps {
  branch: Branch;
  machines: Machine[];
  companyId: string;
}

export function BranchDetailPage({ branch, machines, companyId }: BranchDetailPageProps) {
  const router = useInternalRouter();
  const t = useTranslations('branches');
  const tLimits = useTranslations('companies.limits.reached');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { canCreateMachine, getLimitCheck } = useCompanyLimits(companyId);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/companies/${companyId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{branch.name}</h1>
            {branch.isMainBranch && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {t('mainBranch')}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{t('machinesSubtitle')}</p>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={!canCreateMachine}
              className={!canCreateMachine ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('newMachine')}
            </Button>
          </TooltipTrigger>
          {!canCreateMachine && (
            <TooltipContent side="bottom" className="max-w-[250px] text-center">
              <p className="text-sm">
                {tLimits('machines', {
                  current: getLimitCheck('machines').current,
                  max: getLimitCheck('machines').max,
                })}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <BranchDetail machines={machines} />

      <MachineCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        preselectedBranchId={branch.id}
        preselectedCompanyId={companyId}
      />
    </div>
  );
}
