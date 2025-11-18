'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ProductionLineCard } from './ProductionLineCard';
import { CreateProductionLineDialog } from './CreateProductionLineDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { type ProductionLine } from '@/data/types/production-lines.types';

interface ProductionLinesPageProps {
  productionLines: ProductionLine[];
}

export function ProductionLinesPage({ productionLines }: ProductionLinesPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useInternalRouter();
  const t = useTranslations('productionLines');
  const [optimisticLines, addOptimisticLine] = useOptimistic(
    productionLines,
    (state, newLine: ProductionLine) => [...state, newLine],
  );

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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newButton')}
          </Button>
        </div>

        {optimisticLines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('emptyState')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimisticLines.map((line) => (
              <ProductionLineCard key={line.id} productionLine={line} />
            ))}
          </div>
        )}
      </div>

      <CreateProductionLineDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
