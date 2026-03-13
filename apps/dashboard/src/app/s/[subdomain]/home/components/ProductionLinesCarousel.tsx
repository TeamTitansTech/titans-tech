'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, ArrowRight } from 'lucide-react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { getProductionLines } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import { getProductionLineStatus, statusColors } from '@/lib/alertStatus';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ViewTab } from '../../production-lines/[id]/components/ViewTab';

export function ProductionLinesCarousel() {
  const t = useTranslations('dashboard.client');
  const tProdLines = useTranslations('productionLines');
  const router = useInternalRouter();
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    async function loadProductionLines() {
      setIsLoading(true);
      try {
        const response = await getProductionLines();
        if (response.data) {
          setProductionLines(response.data);
          // Set first production line as active by default
          if (response.data.length > 0) {
            setActiveTab(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading production lines:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductionLines();
  }, []);

  if (isLoading) {
    return null;
  }

  if (productionLines.length === 0) {
    return null;
  }

  const handleCardClick = (lineId: string) => {
    router.push(`/production-lines/${lineId}`);
  };

  // Get current production line
  const currentLine = productionLines.find((line) => line.id === activeTab);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-primary" />
              <CardTitle>{tProdLines('pageTitle')}</CardTitle>
            </div>
            <button
              onClick={() => router.push('/production-lines')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {productionLines.length > 1 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                {productionLines.map((line) => {
                  const machines = line.machines || [];
                  const filteredMachines = machines.filter((pm) => pm.machine);
                  const machinesWithStatus = filteredMachines.map((pm) => pm.machine!);
                  const lineStatus = getProductionLineStatus(machinesWithStatus);

                  return (
                    <TabsTrigger
                      key={line.id}
                      value={line.id}
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      <div className={`w-2 h-2 rounded-full ${statusColors[lineStatus]}`} />
                      <span className="truncate max-w-[150px]">{line.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {productionLines.map((line) => {
                const machines = line.machines || [];
                const filteredMachines = machines.filter((pm) => pm.machine);
                const machineCount = filteredMachines.length;
                const machinesWithStatus = filteredMachines.map((pm) => pm.machine!);
                const lineStatus = getProductionLineStatus(machinesWithStatus);

                return (
                  <TabsContent key={line.id} value={line.id} className="mt-4">
                    <Card
                      className="relative cursor-pointer hover:border-primary/50 hover:shadow-md transition-all overflow-hidden"
                      onClick={() => handleCardClick(line.id)}
                    >
                      {/* Production Line Status Indicator */}
                      <div
                        className={`absolute top-4 right-4 w-3 h-3 rounded-full ${statusColors[lineStatus]} z-10`}
                      />

                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-6">
                              <h3 className="font-semibold text-lg line-clamp-1">{line.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {line.branch?.name || tProdLines('noBlueprintAssigned')}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold">{machineCount}</span>
                                <span className="text-xs text-muted-foreground">
                                  {tProdLines('machineCount')}
                                </span>
                              </div>
                              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                                <Factory className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                          </div>

                          {/* Production Line Visualization */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <ViewTab productionLine={line} canViewMachineDetails={true} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            // Single production line - no tabs needed
            currentLine && (
              <Card
                className="relative cursor-pointer hover:border-primary/50 hover:shadow-md transition-all overflow-hidden"
                onClick={() => handleCardClick(currentLine.id)}
              >
                {/* Production Line Status Indicator */}
                {(() => {
                  const machines = currentLine.machines || [];
                  const filteredMachines = machines.filter((pm) => pm.machine);
                  const machineCount = filteredMachines.length;
                  const machinesWithStatus = filteredMachines.map((pm) => pm.machine!);
                  const lineStatus = getProductionLineStatus(machinesWithStatus);

                  return (
                    <>
                      <div
                        className={`absolute top-4 right-4 w-3 h-3 rounded-full ${statusColors[lineStatus]} z-10`}
                      />

                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-6">
                              <h3 className="font-semibold text-lg line-clamp-1">
                                {currentLine.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {currentLine.branch?.name || tProdLines('noBlueprintAssigned')}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold">{machineCount}</span>
                                <span className="text-xs text-muted-foreground">
                                  {tProdLines('machineCount')}
                                </span>
                              </div>
                              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                                <Factory className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                          </div>

                          {/* Production Line Visualization */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <ViewTab productionLine={currentLine} canViewMachineDetails={true} />
                          </div>
                        </div>
                      </CardContent>
                    </>
                  );
                })()}
              </Card>
            )
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
