'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { ProductionLineKonvaCanvas } from './ProductionLineKonvaCanvas';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface ViewTabProps {
  productionLine: ProductionLine;
  canViewMachineDetails?: boolean;
  canEditCanvas?: boolean;
}

export function ViewTab({
  productionLine,
  canViewMachineDetails = true,
  canEditCanvas = false,
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
    <ProductionLineKonvaCanvas
      productionLine={productionLine}
      canViewMachineDetails={canViewMachineDetails}
      canEdit={canEditCanvas}
    />
  );
}
