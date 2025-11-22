'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Factory, MoveDown, MoveUp } from 'lucide-react';
import { MachineCardInLine } from './MachineCardInLine';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface ViewTabProps {
  productionLine: ProductionLine;
}

export function ViewTab({ productionLine }: ViewTabProps) {
  const t = useTranslations('productionLines');

  const machines = productionLine.machines || [];
  const filteredMachines = machines.filter((pm) => pm.machine);
  const shouldAlternateLayout = filteredMachines.length > 2;

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
      <div className="hidden lg:block overflow-x-auto pb-8">
        <div className="relative min-w-max px-12 pt-8 pb-16">
          {shouldAlternateLayout ? (
            <div className="relative flex flex-col ">
              <div className="flex justify-between items-end gap-8">
                {filteredMachines.map((productionLineMachine, index) => {
                  if (index % 2 !== 0) return null;
                  return (
                    <div
                      key={productionLineMachine.machineId}
                      className="relative flex flex-col items-center"
                    >
                      <MachineCardInLine machine={productionLineMachine.machine!} />
                      <div className="flex flex-col items-center mt-5">
                        <MoveUp className="w-6 h-6 text-green-500 -mb-1" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative h-1 w-full">
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              </div>

              <div className="flex justify-center items-start gap-8">
                {filteredMachines.map((productionLineMachine, index) => {
                  if (index % 2 === 0) return null;
                  return (
                    <div
                      key={productionLineMachine.machineId}
                      className="relative flex flex-col items-center"
                    >
                      <div className="flex flex-col items-center mb-5">
                        <MoveDown className="w-6 h-6 text-green-500 -mb-1" />
                      </div>
                      <MachineCardInLine machine={productionLineMachine.machine!} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex justify-between items-end gap-8">
                {filteredMachines.map((productionLineMachine) => (
                  <div
                    key={productionLineMachine.machineId}
                    className="relative flex flex-col items-center"
                  >
                    <MachineCardInLine machine={productionLineMachine.machine!} />
                    <div className="flex flex-col items-center mt-5">
                      <MoveUp className="w-6 h-6 text-green-500 -mb-1" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative h-1">
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden py-8">
        <div className="relative flex">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-green-500" />

          <div className="flex flex-col gap-8 pl-8">
            {filteredMachines.map((productionLineMachine) => (
              <div key={productionLineMachine.machineId} className="relative flex items-center">
                <div className="absolute left-0 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 -translate-x-1/2" />

                <div className="h-1 w-12 bg-green-500" />

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
