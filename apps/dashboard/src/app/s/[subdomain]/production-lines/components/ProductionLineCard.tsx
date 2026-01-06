'use client';

import { Factory } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type ProductionLine } from '@/data/types/production-lines.types';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { getProductionLineStatus, statusColors } from '@/lib/alertStatus';

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
  const machinesWithStatus =
    productionLine.machines?.filter((pm) => pm.machine).map((pm) => pm.machine!) || [];
  const lineStatus = getProductionLineStatus(machinesWithStatus);

  return (
    <Card
      className="relative cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
      onClick={handleClick}
      data-testid={`card-production-line-${productionLine.id}`}
    >
      {/* Production Line Status Indicator */}
      <div
        className={`absolute top-4 right-4 w-3 h-3 rounded-full ${statusColors[lineStatus]}`}
        data-testid={`card-status-${productionLine.id}`}
      />

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-6">
              <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                <Factory
                  className="h-6 w-6 text-primary"
                  data-testid={`card-icon-${productionLine.id}`}
                />
              </div>
              <h3
                className="text-lg font-semibold line-clamp-1"
                data-testid={`card-name-${productionLine.id}`}
              >
                {productionLine.name}
              </h3>
            </div>
          </div>

          <p
            className="text-sm text-muted-foreground line-clamp-2"
            data-testid={`card-description-${productionLine.id}`}
          >
            Linha de produção {machineCount > 0 ? `principal com ${machineCount}` : 'sem'} máquina
            {machineCount !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span data-testid={`card-machine-count-${productionLine.id}`}>
              {machineCount} {t('machineCount')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
