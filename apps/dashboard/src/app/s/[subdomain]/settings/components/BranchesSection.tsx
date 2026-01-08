'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type CompanyBranch } from '@/data/services/company-branches.api';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { hasPermissionInBranch } from '@titans-tech/shared/types';
import { EditBranchDialog } from '@/components/shared/settings/EditBranchDialog';

interface BranchesSectionProps {
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  initialBranches: CompanyBranch[] | null;
  onBranchUpdated?: () => void;
}

export function BranchesSection({
  selectedBranchId,
  onSelectBranch,
  initialBranches,
  onBranchUpdated,
}: BranchesSectionProps) {
  const t = useTranslations('settings.branches');
  const { companyUser } = useCompanyUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<CompanyBranch | null>(null);

  const branches = initialBranches || [];

  const handleEditClick = (branch: CompanyBranch, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  if (branches.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <h3 className="text-base font-semibold">{t('title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t('noBranches')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <h3 className="text-base font-semibold">{t('title')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;
          const hasUpdatePermission = hasPermissionInBranch(
            companyUser,
            branch.id,
            'updateBranches',
          );

          console.log(hasUpdatePermission);

          return (
            <Card
              key={branch.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => onSelectBranch(branch.id)}
              data-testid={`branch-card-client-${branch.id}`}
            >
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{branch.name}</h4>
                      {branch.isMainBranch && (
                        <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {t('mainBranch')}
                        </span>
                      )}
                    </div>
                    {hasUpdatePermission && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(branch, e)}
                        className="h-8 w-8 p-0 -mt-1 -mr-2"
                        data-testid={`edit-branch-button-${branch.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">{t('editBranch')}</span>
                      </Button>
                    )}
                  </div>
                  {branch.location && (
                    <p className="text-sm text-muted-foreground">{branch.location}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <Users className="h-4 w-4" />
                    <span>{t('clickToViewUsers')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EditBranchDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        branch={selectedBranch}
        onSuccess={onBranchUpdated}
      />
    </div>
  );
}
