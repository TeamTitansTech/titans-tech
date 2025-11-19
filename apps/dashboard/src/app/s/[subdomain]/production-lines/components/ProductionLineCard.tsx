'use client';

import { Factory, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type ProductionLine } from '@/data/types/production-lines.types';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';

interface ProductionLineCardProps {
  productionLine: ProductionLine;
}

export function ProductionLineCard({ productionLine }: ProductionLineCardProps) {
  const router = useInternalRouter();
  const t = useTranslations('productionLines');

  const handleClick = () => {
    router.push(`/production-lines/${productionLine.id}`);
  };

  const machineCount = productionLine._count?.machines || productionLine.machines?.length || 0;

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
      onClick={handleClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-primary/10">
              <Factory className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              active
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{productionLine.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              Linha de produção com máquinas configuradas
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>
              {machineCount} {t('machineCount')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
