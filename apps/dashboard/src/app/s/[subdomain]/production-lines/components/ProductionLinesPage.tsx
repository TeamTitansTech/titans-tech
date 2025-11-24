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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductionLinesPageProps {
  productionLines: ProductionLine[];
}

export function ProductionLinesPage({ productionLines }: ProductionLinesPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const router = useInternalRouter();
  const t = useTranslations('productionLines');
  const { companyUser } = useCompanyUser();
  const [optimisticLines, addOptimisticLine] = useOptimistic(
    productionLines,
    (state, newLine: ProductionLine) => [...state, newLine],
  );

  // Get branches where user has permission to read production lines
  const userBranches = useMemo(() => {
    if (!companyUser) return [];
    // Company admins and managers can see all branches
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) {
      return companyUser.branches.map((ub) => ({
        id: ub.branchId,
        name: ub.branch.name,
      }));
    }
    // Regular users only see branches where they have readProductionLines permission
    return companyUser.branches
      .filter((ub) => ub.readProductionLines)
      .map((ub) => ({
        id: ub.branchId,
        name: ub.branch.name,
      }));
  }, [companyUser]);

  // Filter production lines by selected branch
  const filteredProductionLines = useMemo(() => {
    if (selectedBranchFilter === 'all') return optimisticLines;
    return optimisticLines.filter((line) => line.branchId === selectedBranchFilter);
  }, [optimisticLines, selectedBranchFilter]);

  // Check if user has permission to create production lines in the selected branch
  const canCreateProductionLines = () => {
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
                <SelectItem value="all">All Branches</SelectItem>
                {userBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    disabled={!canCreateProductionLines()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('newButton')}
                  </Button>
                </div>
              </TooltipTrigger>
              {!canCreateProductionLines() && (
                <TooltipContent>
                  <p>{t('selectBranchToCreate')}</p>
                </TooltipContent>
              )}
            </Tooltip>
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
