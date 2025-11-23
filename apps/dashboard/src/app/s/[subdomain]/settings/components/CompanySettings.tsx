'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { CompanyInfoSection } from './CompanyInfoSection';
import { BranchesSection } from './BranchesSection';
import { BranchUserManagement } from './BranchUserManagement';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { hasPermission } from '@/lib/permissions';
import { useBranch } from '@/contexts/BranchContext';

export function CompanySettings() {
  const t = useTranslations('settings');
  const { companyUser } = useCompanyUser();
  const { selectedBranchId: contextSelectedBranchId } = useBranch();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Check if user has permission to read ALL branches
  // Company admins and managers can see all branches
  const canReadAllBranches =
    companyUser?.isCompanyAdmin ||
    companyUser?.isCompanyManager ||
    (contextSelectedBranchId
      ? hasPermission(companyUser, contextSelectedBranchId, 'readBranches')
      : false);

  // Users can always see their assigned branches
  const hasAssignedBranches = (companyUser?.branches?.length ?? 0) > 0;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('pageDescription')}</p>
      </div>

      <Separator />

      <CompanyInfoSection />

      {hasAssignedBranches && (
        <>
          <Separator />
          <BranchesSection
            selectedBranchId={selectedBranchId}
            onSelectBranch={setSelectedBranchId}
            showAllBranches={canReadAllBranches}
          />

          {selectedBranchId && (
            <>
              <Separator />
              <BranchUserManagement branchId={selectedBranchId} />
            </>
          )}
        </>
      )}
    </div>
  );
}
