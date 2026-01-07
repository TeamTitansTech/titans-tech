'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Plus, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useCompanyLimits } from '@/hooks/useCompanyLimits';
import { getAllBranches, type CompanyBranch } from '@/data/services/company-branches.api';
import { CreateBranchDialog } from '@/app/admin/companies/[companyId]/components/CreateBranchDialog';
import { AddUserDialog } from './AddUserDialog';
import { toast } from 'sonner';

interface BranchesSectionProps {
  companyId: string;
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onUserAdded?: () => void;
}

export function BranchesSection({
  companyId,
  selectedBranchId,
  onSelectBranch,
  onUserAdded,
}: BranchesSectionProps) {
  const t = useTranslations('settings.branches');
  const tCompanies = useTranslations('companies');
  const tUserManagement = useTranslations('settings.userManagement');
  const tLimits = useTranslations('companies.limits.reached');
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { canCreateBranch, canCreateUser, getLimitCheck } = useCompanyLimits(companyId);

  const handleUserAdded = () => {
    onUserAdded?.();
  };

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    const fetchBranches = async () => {
      setIsLoading(true);
      const response = await getAllBranches({ companyId });

      if (cancelled) return;

      if (response.errors) {
        toast.error(t('loadingFailed'));
      } else {
        setBranches(response.data || []);
      }
      setIsLoading(false);
    };

    fetchBranches();

    return () => {
      cancelled = true;
    };
  }, [companyId, t]);

  const handleSuccess = async () => {
    setIsLoading(true);
    const response = await getAllBranches({ companyId });
    if (response.errors) {
      toast.error(t('loadingFailed'));
    } else {
      setBranches(response.data || []);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('title')}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddUserDialogOpen(true)}
                className="flex-1 sm:flex-none"
                data-testid="add-user-button-loading"
              >
                <UserPlus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{tUserManagement('addUser')}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex-1 sm:flex-none"
                data-testid="create-branch-button-loading"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{tCompanies('newBranch')}</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
        <CreateBranchDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleSuccess}
          companyId={companyId}
        />
        <AddUserDialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
          companyId={companyId}
          onSuccess={handleUserAdded}
        />
      </>
    );
  }

  if (branches.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('title')}
            </h3>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddUserDialogOpen(true)}
                      disabled={!canCreateUser}
                      className={`flex-1 sm:flex-none ${!canCreateUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      data-testid="add-user-button-no-branches"
                    >
                      <UserPlus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{tUserManagement('addUser')}</span>
                    </Button>
                  </TooltipTrigger>
                  {!canCreateUser && (
                    <TooltipContent side="bottom" className="max-w-[250px] text-center">
                      <p className="text-sm">
                        {tLimits('users', {
                          current: getLimitCheck('users').current,
                          max: getLimitCheck('users').max,
                        })}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateDialogOpen(true)}
                      disabled={!canCreateBranch}
                      className={`flex-1 sm:flex-none ${!canCreateBranch ? 'opacity-50 cursor-not-allowed' : ''}`}
                      data-testid="create-branch-button-no-branches"
                    >
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{tCompanies('newBranch')}</span>
                    </Button>
                  </TooltipTrigger>
                  {!canCreateBranch && (
                    <TooltipContent side="bottom" className="max-w-[250px] text-center">
                      <p className="text-sm">
                        {tLimits('branches', {
                          current: getLimitCheck('branches').current,
                          max: getLimitCheck('branches').max,
                        })}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t('noBranches')}</p>
        </div>
        <CreateBranchDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleSuccess}
          companyId={companyId}
        />
        <AddUserDialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
          companyId={companyId}
          onSuccess={handleUserAdded}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="branches-section">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('title')}
          </h3>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddUserDialogOpen(true)}
                    disabled={!canCreateUser}
                    className={`flex-1 sm:flex-none ${!canCreateUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="add-user-button"
                  >
                    <UserPlus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{tUserManagement('addUser')}</span>
                  </Button>
                </TooltipTrigger>
                {!canCreateUser && (
                  <TooltipContent side="bottom" className="max-w-[250px] text-center">
                    <p className="text-sm">
                      {tLimits('users', {
                        current: getLimitCheck('users').current,
                        max: getLimitCheck('users').max,
                      })}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                    disabled={!canCreateBranch}
                    className={`flex-1 sm:flex-none ${!canCreateBranch ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="create-branch-button"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{tCompanies('newBranch')}</span>
                  </Button>
                </TooltipTrigger>
                {!canCreateBranch && (
                  <TooltipContent side="bottom" className="max-w-[250px] text-center">
                    <p className="text-sm">
                      {tLimits('branches', {
                        current: getLimitCheck('branches').current,
                        max: getLimitCheck('branches').max,
                      })}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="branches-grid"
        >
          {branches.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <Card
                key={branch.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => onSelectBranch(branch.id)}
                data-testid={`branch-card-${branch.id}`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`branch-name-${branch.id}`}>
                          {branch.name}
                        </h4>
                        {branch.isMainBranch && (
                          <span
                            className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                            data-testid={`main-branch-badge-${branch.id}`}
                          >
                            {t('mainBranch')}
                          </span>
                        )}
                      </div>
                    </div>
                    {branch.location && (
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid={`branch-location-${branch.id}`}
                      >
                        {branch.location}
                      </p>
                    )}
                    <div
                      className="flex items-center gap-1 text-sm text-muted-foreground mt-2"
                      data-testid={`branch-users-count-${branch.id}`}
                    >
                      <Users className="h-4 w-4" />
                      <span>
                        {branch._count?.users ?? 0} {t('users')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <CreateBranchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
        companyId={companyId}
      />
      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        companyId={companyId}
        onSuccess={handleUserAdded}
      />
    </>
  );
}
