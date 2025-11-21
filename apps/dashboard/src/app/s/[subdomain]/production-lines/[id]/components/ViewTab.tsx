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
  const filteredMachines = machines.filter((pm) => pm.machine);

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
    <div className="relative w-full">
      {/* Layout Horizontal (Desktop - >= 1024px) */}
      <div className="hidden lg:block overflow-x-auto pb-8">
        <div className="relative min-w-max px-12 pt-8 pb-16">
          <div className="relative">
            {/* Cards das máquinas posicionados horizontalmente */}
            <div className="flex justify-between items-end mb-12 gap-8">
              {filteredMachines.map((productionLineMachine) => (
                <div
                  key={productionLineMachine.machineId}
                  className="relative flex flex-col items-center"
                >
                  <MachineCardInLine machine={productionLineMachine.machine!} />
                  {/* Linha vertical conectando o card à linha horizontal */}
                  <div className="w-1 h-12 bg-green-500" />
                </div>
              ))}
            </div>

            {/* Linha horizontal principal */}
            <div className="relative h-1">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
                <div className="flex justify-between">
                  {filteredMachines.map((productionLineMachine) => (
                    <div
                      key={`point-${productionLineMachine.machineId}`}
                      className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Vertical (Mobile/Tablet - < 1024px) */}
      <div className="lg:hidden py-8">
        <div className="relative flex">
          {/* Linha vertical contínua à esquerda */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-green-500" />

          {/* Container dos cards */}
          <div className="flex flex-col gap-8 pl-8">
            {filteredMachines.map((productionLineMachine, index) => (
              <div key={productionLineMachine.machineId} className="relative flex items-center">
                {/* Ponto circular no conector */}
                <div className="absolute left-0 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 -translate-x-1/2" />

                {/* Linha horizontal conectando o ponto ao card */}
                <div className="h-1 w-12 bg-green-500" />

                {/* Card da máquina */}
                <div className="flex-shrink-0">
                  <MachineCardInLine machine={productionLineMachine.machine!} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
