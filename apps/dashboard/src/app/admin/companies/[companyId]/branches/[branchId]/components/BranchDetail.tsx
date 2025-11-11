'use client';

import { useState } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyUser } from '@/contexts/CompanyUserContext';

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

interface BranchDetailProps {
  branch: Branch;
  machines: Machine[];
  companyId: string;
}

export function BranchDetail({ branch, machines, companyId }: BranchDetailProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useInternalRouter();
  const t = useTranslations('branches');
  const { companyUser } = useCompanyUser();

  const canCreateMachines = () => {
    if (!companyUser) return false;

    // Company Admin and Manager can do everything
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) {
      return true;
    }

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === branch.id);
    return userBranch?.createMachines || false;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSuccess = () => {
    router.refresh();
  };

  const handleMachineClick = (machineId: string) => {
    router.push(`/machines/${machineId}`);
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
        {canCreateMachines() && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newMachine')}
          </Button>
        )}
      </div>

      {machines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noMachines')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <Card
              key={machine.id}
              className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleMachineClick(machine.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Wrench className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <CardTitle className="mt-4">{machine.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{t('blueprint')}:</span>{' '}
                    {machine.blueprint?.name || t('noBlueprint')}
                  </div>
                  {machine.fields.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {machine.fields.length} {t('fields')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
