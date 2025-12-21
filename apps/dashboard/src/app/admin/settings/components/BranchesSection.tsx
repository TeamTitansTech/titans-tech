'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Plus, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  const t = useTranslations('adminSettings.branches');
  const tLimits = useTranslations('companies.limits.reached');
  const tCompanies = useTranslations('companies');
  const tUserManagement = useTranslations('adminSettings.userManagement');
  const { canCreateUser, canCreateBranch, getLimitCheck } = useCompanyLimits(companyId);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('title')}
            </h3>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddUserDialogOpen(true)}
                    disabled={!canCreateUser}
                    className={!canCreateUser ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {tUserManagement('addUser')}
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

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    disabled={!canCreateBranch}
                    className={!canCreateBranch ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tCompanies('newBranch')}
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('title')}
            </h3>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddUserDialogOpen(true)}
                    disabled={!canCreateUser}
                    className={!canCreateUser ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {tUserManagement('addUser')}
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

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    disabled={!canCreateBranch}
                    className={!canCreateBranch ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tCompanies('newBranch')}
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('title')}
          </h3>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserDialogOpen(true)}
                  disabled={!canCreateUser}
                  className={!canCreateUser ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {tUserManagement('addUser')}
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

            <Tooltip>
              <TooltipTrigger>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={!canCreateBranch}
                  className={!canCreateBranch ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tCompanies('newBranch')}
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    </div>
                    {branch.location && (
                      <p className="text-sm text-muted-foreground">{branch.location}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
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
