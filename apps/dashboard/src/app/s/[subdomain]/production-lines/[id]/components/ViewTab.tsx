'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { MachineCardInLine } from './MachineCardInLine';
import type { ProductionLine, ProductionLineMachine } from '@/data/types/production-lines.types';

interface ViewTabProps {
  productionLine: ProductionLine;
  canViewMachineDetails?: boolean;
}

export function ViewTab({ productionLine, canViewMachineDetails = true }: ViewTabProps) {
  const t = useTranslations('productionLines');

  // Get ordered machines based on saved order
  const orderedMachines =
    productionLine.machines
      ?.sort((a, b) => a.order - b.order)
      .filter((pm): pm is ProductionLineMachine => pm.machine !== undefined) || [];

  if (orderedMachines.length === 0) {
    return (
      <Card data-testid="view-empty-state">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Factory
              className="w-16 h-16 mx-auto text-muted-foreground opacity-50"
              data-testid="view-empty-icon"
            />
            <div>
              <p className="text-lg font-medium" data-testid="view-empty-title">
                {t('noMachinesConfigured')}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="view-empty-description">
                {t('configureFirst')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separate main machine (order 0) and other machines
  const mainMachine = orderedMachines[0]; // First machine is the principal
  const otherMachines = orderedMachines.slice(1); // Rest are regular machines

  // Split other machines into top and bottom rows (alternating)
  const topRowMachines = otherMachines.filter((_, index) => index % 2 === 0);
  const bottomRowMachines = otherMachines.filter((_, index) => index % 2 !== 0);

  // Display machines in reverse order (right to left flow)
  const displayTopRow = [...topRowMachines].reverse();
  const displayBottomRow = [...bottomRowMachines].reverse();

  return (
    <div className="relative w-full" data-testid="view-production-line-layout">
      {/* Desktop layout - flexbox with absolute positioned line */}
      <div className="hidden lg:block overflow-x-auto pb-8" data-testid="view-desktop-layout">
        <div className="relative min-w-max px-8 py-8">
          {/* Horizontal line - absolutely positioned at vertical center */}
          <div
            className="absolute h-1 bg-green-500 z-0"
            style={{
              left: '2rem',
              right: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            data-testid="view-production-line"
          />

          <div className="relative z-10 flex items-center">
            {/* Middle section: machines above and below the line - fills available space */}
            <div className="flex-1 flex flex-col">
              {/* Top machines with vertical connectors - spread evenly */}
              <div className="flex items-end justify-evenly" data-testid="view-top-machines">
                {displayTopRow.map((pm) => (
                  <div
                    key={pm.machineId}
                    className="flex flex-col items-center"
                    data-testid={`view-top-machine-${pm.machineId}`}
                  >
                    <MachineCardInLine
                      machine={pm.machine!}
                      canViewDetails={canViewMachineDetails}
                    />
                    {/* Vertical connector going down to the line */}
                    <div
                      className="w-0.5 h-8 bg-green-500"
                      data-testid={`view-connector-${pm.machineId}`}
                    />
                  </div>
                ))}
              </div>

              {/* Spacer where the line passes through */}
              <div className="h-1" />

              {/* Bottom machines with vertical connectors - spread evenly with offset */}
              <div
                className="flex items-start justify-evenly px-[100px]"
                data-testid="view-bottom-machines"
              >
                {displayBottomRow.map((pm) => (
                  <div
                    key={pm.machineId}
                    className="flex flex-col items-center"
                    data-testid={`view-bottom-machine-${pm.machineId}`}
                  >
                    {/* Vertical connector going up from the line */}
                    <div
                      className="w-0.5 h-8 bg-green-500"
                      data-testid={`view-connector-${pm.machineId}`}
                    />
                    <MachineCardInLine
                      machine={pm.machine!}
                      canViewDetails={canViewMachineDetails}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Main machine at the end of the line */}
            {mainMachine && (
              <div className="flex items-center ml-4" data-testid="view-main-machine">
                {/* Horizontal connector to main machine */}
                <div className="h-1 w-8 bg-green-500" data-testid="view-main-connector" />
                <MachineCardInLine
                  machine={mainMachine.machine!}
                  canViewDetails={canViewMachineDetails}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden py-8" data-testid="view-mobile-layout">
        <div className="relative flex">
          <div
            className="absolute left-8 top-0 bottom-0 w-1 bg-green-500"
            data-testid="view-mobile-line"
          />

          <div className="flex flex-col gap-8 pl-8" data-testid="view-mobile-machines">
            {orderedMachines.map((productionLineMachine) => (
              <div
                key={productionLineMachine.machineId}
                className="relative flex items-center"
                data-testid={`view-mobile-machine-${productionLineMachine.machineId}`}
              >
                <div
                  className="absolute left-0 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 -translate-x-1/2"
                  data-testid={`view-mobile-dot-${productionLineMachine.machineId}`}
                />
                <div
                  className="h-1 w-12 bg-green-500"
                  data-testid={`view-mobile-connector-${productionLineMachine.machineId}`}
                />
                <MachineCardInLine
                  machine={productionLineMachine.machine!}
                  canViewDetails={canViewMachineDetails}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
