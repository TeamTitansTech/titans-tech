'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { CompanyInfoSection } from './CompanyInfoSection';
import { BranchesSection } from './BranchesSection';
import { BranchUserManagement } from './BranchUserManagement';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { hasPermissionInAnyBranch } from '@titans-tech/shared/types';

export function CompanySettings() {
  const t = useTranslations('settings');
  const { companyUser } = useCompanyUser();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Check if user can view branches (company admins or users with readBranches permission)
  // Note: isCompanyAdmin already grants all permissions via hasPermissionInAnyBranch
  const canViewBranches =
    companyUser?.isCompanyAdmin || hasPermissionInAnyBranch(companyUser, 'readBranches');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('pageDescription')}</p>
      </div>

      <Separator />

      <CompanyInfoSection />

      {canViewBranches && (
        <>
          <Separator />
          <BranchesSection
            selectedBranchId={selectedBranchId}
            onSelectBranch={setSelectedBranchId}
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
