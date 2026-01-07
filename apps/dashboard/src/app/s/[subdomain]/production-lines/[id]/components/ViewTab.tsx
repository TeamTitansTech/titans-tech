'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { ProductionLineCanvas } from './ProductionLineCanvas';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface ViewTabProps {
  productionLine: ProductionLine;
  canViewMachineDetails?: boolean;
  canEdit?: boolean;
}

export function ViewTab({
  productionLine,
  canViewMachineDetails = true,
  canEdit = false,
}: ViewTabProps) {
  const t = useTranslations('productionLines');

  const hasMachines = productionLine.machines && productionLine.machines.length > 0;

  if (!hasMachines) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Factory className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-lg font-medium">{t('noMachinesConfigured')}</p>
              <p className="text-sm text-muted-foreground">{t('configureFirst')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ProductionLineCanvas
      productionLine={productionLine}
      canViewMachineDetails={canViewMachineDetails}
      canEdit={canEdit}
    />
  );
}
