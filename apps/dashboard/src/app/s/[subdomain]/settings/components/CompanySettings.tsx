'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { CompanyInfoSection } from './CompanyInfoSection';
import { BranchesSection } from './BranchesSection';
import { BranchUserManagement } from './BranchUserManagement';

export function CompanySettings() {
  const t = useTranslations('settings');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('pageDescription')}</p>
      </div>

      <Separator />

      <CompanyInfoSection />

      <Separator />

      <BranchesSection selectedBranchId={selectedBranchId} onSelectBranch={setSelectedBranchId} />

      {selectedBranchId && (
        <>
          <Separator />
          <BranchUserManagement branchId={selectedBranchId} />
        </>
      )}
    </div>
  );
}
