'use client';

import { useState, useOptimistic, startTransition, useMemo } from 'react';
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
import { getBranchesWithPermission, filterByBranchPermission } from '@/lib/branchFilters';
import { type CompanyBranch } from '@/data/services/company-branches.api';

interface ProductionLinesPageProps {
  productionLines: ProductionLine[];
  allBranches: CompanyBranch[];
}

export function ProductionLinesPage({ productionLines, allBranches }: ProductionLinesPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const router = useInternalRouter();
  const t = useTranslations('productionLines');
  const { companyUser } = useCompanyUser();
  const { sysAdminUser } = useSysAdmin();
  const isSysAdmin = !!sysAdminUser;
  const [optimisticLines, addOptimisticLine] = useOptimistic(
    productionLines,
    (state, newLine: ProductionLine) => [...state, newLine],
  );

  // Get branches where user has permission to read production lines
  // Use server-provided branches with machine counts
  const userBranches = useMemo(() => {
    if (isSysAdmin) {
      // Use all branches, formatted with company name
      return allBranches.map((branch) => ({
        id: branch.id,
        name: branch.company ? `${branch.company.name} - ${branch.name}` : branch.name,
        location: branch.location,
        machineCount: branch._count?.machines ?? 0,
      }));
    }

    // For company users, filter to branches they have permission for and add machine counts
    const allowedBranches = getBranchesWithPermission(companyUser, 'readProductionLines');
    return allowedBranches.map((branch) => {
      // Find the full branch data to get machine count
      const fullBranch = allBranches.find((b) => b.id === branch.id);
      return {
        ...branch,
        machineCount: fullBranch?._count?.machines ?? 0,
      };
    });
  }, [companyUser, isSysAdmin, allBranches]);

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

    // Company admin can create production lines
    if (companyUser.isCompanyAdmin) return true;

    // Check if user has createProductionLines permission in at least one branch
    return companyUser.branches.some((ub) => ub.createProductionLines);
  }, [companyUser, isSysAdmin]);

  // Get branches where user can CREATE production lines (for the create dialog)
  const creatableBranches = useMemo(() => {
    if (isSysAdmin) {
      // Sysadmin can create in any branch
      return userBranches;
    }

    if (!companyUser) return [];

    // Company admin can create in all their branches
    if (companyUser.isCompanyAdmin) {
      return userBranches;
    }

    // Regular users: filter to branches where they have createProductionLines permission
    const creatableBranchIds = companyUser.branches
      .filter((ub) => ub.createProductionLines)
      .map((ub) => ub.branchId);

    return userBranches.filter((branch) => creatableBranchIds.includes(branch.id));
  }, [companyUser, isSysAdmin, userBranches]);

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
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{t('pageDescription')}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Branch Filter */}
            <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
              <SelectTrigger className="w-[180px] sm:w-[250px] [&_.branch-location]:hidden">
                <MapPin className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allBranches')}</SelectItem>
                {userBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id} textValue={branch.name}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span>{branch.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {branch.machineCount} {branch.machineCount === 1 ? 'machine' : 'machines'}
                        </span>
                      </div>
                      {branch.location && (
                        <span className="branch-location text-xs text-muted-foreground truncate max-w-[180px]">
                          {branch.location}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasCreateProductionLinesPermission && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('newButton')}
              </Button>
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
        branches={creatableBranches}
        preselectedBranchId={selectedBranchFilter !== 'all' ? selectedBranchFilter : undefined}
      />
    </>
  );
}
