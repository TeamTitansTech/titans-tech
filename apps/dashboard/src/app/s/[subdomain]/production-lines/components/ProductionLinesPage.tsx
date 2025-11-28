'use client';

import { useState, useOptimistic, startTransition, useMemo, useEffect } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ProductionLineCard } from './ProductionLineCard';
import { CreateProductionLineDialog } from './CreateProductionLineDialog';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { type ProductionLine } from '@/data/types/production-lines.types';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getBranchesWithPermission, filterByBranchPermission } from '@/lib/branchFilters';
import {
  getAllBranchesForSysAdmin,
  type CompanyBranch,
} from '@/data/services/company-branches.api';

interface ProductionLinesPageProps {
  productionLines: ProductionLine[];
}

export function ProductionLinesPage({ productionLines }: ProductionLinesPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [allBranchesForSysAdmin, setAllBranchesForSysAdmin] = useState<CompanyBranch[]>([]);
  const router = useInternalRouter();
  const t = useTranslations('productionLines');
  const { companyUser } = useCompanyUser();
  const { sysAdminUser } = useSysAdmin();
  const isSysAdmin = !!sysAdminUser;
  const [optimisticLines, addOptimisticLine] = useOptimistic(
    productionLines,
    (state, newLine: ProductionLine) => [...state, newLine],
  );

  // Fetch all branches for sysadmin
  useEffect(() => {
    if (isSysAdmin) {
      getAllBranchesForSysAdmin().then((response) => {
        if (response.data) {
          setAllBranchesForSysAdmin(response.data);
        }
      });
    }
  }, [isSysAdmin]);

  // Get branches where user has permission to read production lines
  // For sysadmin, use all branches fetched from API
  const userBranches = useMemo(() => {
    if (isSysAdmin) {
      // Use all branches fetched from API, formatted with company name
      return allBranchesForSysAdmin.map((branch) => ({
        id: branch.id,
        name: branch.company ? `${branch.company.name} - ${branch.name}` : branch.name,
      }));
    }
    return getBranchesWithPermission(companyUser, 'readProductionLines');
  }, [companyUser, isSysAdmin, allBranchesForSysAdmin]);

  // Filter production lines by selected branch
  const filteredProductionLines = useMemo(() => {
    if (isSysAdmin) {
      // Sysadmin sees all, just filter by branch if selected
      if (selectedBranchFilter === 'all') return optimisticLines;
      return optimisticLines.filter((line) => line.branchId === selectedBranchFilter);
    }
    return filterByBranchPermission(
      optimisticLines,
      companyUser,
      selectedBranchFilter,
      'readProductionLines',
    );
  }, [optimisticLines, selectedBranchFilter, companyUser, isSysAdmin]);

  // Check if user has permission to create production lines in ANY branch (to show/hide button)
  const hasCreateProductionLinesPermission = useMemo(() => {
    // Sysadmin can do everything
    if (isSysAdmin) return true;

    if (!companyUser) return false;

    // Company admin and manager can create production lines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check if user has createProductionLines permission in at least one branch
    return companyUser.branches.some((ub) => ub.createProductionLines);
  }, [companyUser, isSysAdmin]);

  // Check if user can create production lines in the currently selected branch (to enable/disable button)
  const canCreateInSelectedBranch = () => {
    // Sysadmin can create in any selected branch
    if (isSysAdmin) return selectedBranchFilter !== 'all';

    if (!companyUser) return false;
    if (selectedBranchFilter === 'all') return false; // Need to select a specific branch to create

    // Company admin and manager can create production lines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === selectedBranchFilter);
    return userBranch?.createProductionLines || false;
  };

  const handleSuccess = (newLine?: ProductionLine) => {
    startTransition(() => {
      if (newLine) {
        addOptimisticLine(newLine);
      }
      router.refresh();
      setIsCreateDialogOpen(false);
    });
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
            <p className="text-muted-foreground">{t('pageDescription')}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Branch Filter */}
            <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
              <SelectTrigger className="w-[200px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allBranches')}</SelectItem>
                {userBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasCreateProductionLinesPermission && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      disabled={!canCreateInSelectedBranch()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('newButton')}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canCreateInSelectedBranch() && (
                  <TooltipContent>
                    <p>{t('selectBranchToCreate')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>
        </div>

        {filteredProductionLines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedBranchFilter === 'all'
                ? t('emptyState')
                : 'No production lines in this branch'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProductionLines.map((line) => (
              <ProductionLineCard key={line.id} productionLine={line} />
            ))}
          </div>
        )}
      </div>

      <CreateProductionLineDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
        branchId={selectedBranchFilter !== 'all' ? selectedBranchFilter : undefined}
      />
    </>
  );
}
