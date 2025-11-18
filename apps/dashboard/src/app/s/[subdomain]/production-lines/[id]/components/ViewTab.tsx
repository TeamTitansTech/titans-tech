'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { MachineCardInLine } from './MachineCardInLine';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface ViewTabProps {
  productionLine: ProductionLine;
}

export function ViewTab({ productionLine }: ViewTabProps) {
  const t = useTranslations('productionLines');

  const machines = productionLine.machines || [];

  if (machines.length === 0) {
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
    <div className="relative">
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-6 min-w-full px-2">
          {machines.map((machine) => (
            <MachineCardInLine key={machine.id} machine={machine} />
          ))}
        </div>
      </div>
    </div>
  );
}
