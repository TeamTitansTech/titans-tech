'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CompanyInfoSection } from './CompanyInfoSection';
import { BranchesSection } from './BranchesSection';
import { BranchUserManagement } from './BranchUserManagement';
import { AddUserDialog } from './AddUserDialog';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { hasPermissionInAnyBranch } from '@titans-tech/shared/types';

export function CompanySettings() {
  const t = useTranslations('settings');
  const { companyUser } = useCompanyUser();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if user can view branches (company admins or users with readBranches permission)
  // Note: isCompanyAdmin already grants all permissions via hasPermissionInAnyBranch
  const canViewBranches =
    companyUser?.isCompanyAdmin || hasPermissionInAnyBranch(companyUser, 'readBranches');

  const canCreateUsers =
    companyUser?.isCompanyAdmin || hasPermissionInAnyBranch(companyUser, 'createUsers');

  const handleUserAdded = useCallback(() => {
    // Trigger refresh in BranchUserManagement
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('pageDescription')}</p>
        </div>
        {canCreateUsers && companyUser?.companyId && (
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('userManagement.addUser')}
          </Button>
        )}
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
              <BranchUserManagement branchId={selectedBranchId} refreshKey={refreshKey} />
            </>
          )}
        </>
      )}

      {/* Add User Dialog */}
      {companyUser?.companyId && (
        <AddUserDialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
          companyId={companyUser.companyId}
          onSuccess={handleUserAdded}
        />
      )}
    </div>
  );
}
