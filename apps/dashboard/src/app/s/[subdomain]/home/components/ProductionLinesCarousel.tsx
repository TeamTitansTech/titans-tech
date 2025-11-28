'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Factory, ArrowRight, Box, MoveUp, MoveDown } from 'lucide-react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { getProductionLines } from '@/data/services/production-lines.api';
import type { ProductionLine, MachineWithStatus } from '@/data/types/production-lines.types';
import Image from 'next/image';
import {
  getAlertStatus,
  getProductionLineStatus,
  statusColors,
  getSectionStatus,
  type SectionStatus,
} from '@/lib/alertStatus';
import { TooltipProvider } from '@/components/ui/tooltip';

// Map section enum values to i18n keys (matching machines.sectionNames in translations)
const SECTION_I18N_KEYS: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  SLIDE: 'slide',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance',
  TRAMMING: 'tramming',
  PISTONS: 'pistons',
};

const sectionStatusDotColors: Record<SectionStatus, string> = {
  ok: 'bg-green-500',
  warning: 'bg-yellow-500',
  alert: 'bg-red-500',
  unknown: 'bg-gray-400',
};

// Helper component to render section list for a machine
function MachineSectionList({ machine }: { machine: MachineWithStatus }) {
  const tSections = useTranslations('machines.sectionNames');
  const sections = (machine.blueprint?.sections as string[]) || [];

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5 mt-1.5">
      {sections.map((section) => {
        const status = getSectionStatus(section, machine);
        const i18nKey = SECTION_I18N_KEYS[section];
        const label = i18nKey ? tSections(i18nKey) : section;

        return (
          <div key={section} className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${sectionStatusDotColors[status]}`}
            />
            <span className="text-[8px] text-muted-foreground leading-tight truncate">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ProductionLinesCarousel() {
  const t = useTranslations('dashboard.client');
  const tProdLines = useTranslations('productionLines');
  const router = useInternalRouter();
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function loadProductionLines() {
      setIsLoading(true);
      try {
        const response = await getProductionLines();
        if (response.data) {
          setProductionLines(response.data);
        }
      } catch (error) {
        console.error('Error loading production lines:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductionLines();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  if (isLoading) {
    return null;
  }

  if (productionLines.length === 0) {
    return null;
  }

  const handleCardClick = (lineId: string) => {
    router.push(`/production-lines/${lineId}`);
  };

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
          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {productionLines.map((line) => {
                const machines = line.machines || [];
                const filteredMachines = machines.filter((pm) => pm.machine);
                const machineCount = filteredMachines.length;
                const machinesWithStatus = filteredMachines.map((pm) => pm.machine!);
                const lineStatus = getProductionLineStatus(machinesWithStatus);

                return (
                  <CarouselItem key={line.id} className="pl-2 md:pl-4 basis-full min-w-0">
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
                          {machineCount > 0 ? (
                            <>
                              {/* Desktop layout - horizontal with alternating rows */}
                              <div className="hidden md:block relative overflow-x-auto py-4">
                                <div className="flex flex-col min-w-max px-4">
                                  {/* Top row - even indexed machines */}
                                  <div className="flex justify-center gap-4 mb-1">
                                    {filteredMachines.map((productionLineMachine, index) => {
                                      const machine = productionLineMachine.machine!;
                                      const isTop = index % 2 === 0;
                                      if (!isTop) {
                                        return (
                                          <div
                                            key={productionLineMachine.machineId}
                                            className="w-40"
                                          />
                                        );
                                      }
                                      return (
                                        <div
                                          key={productionLineMachine.machineId}
                                          className="flex flex-col items-center"
                                        >
                                          <div className="w-40 bg-background rounded-lg overflow-hidden border shadow-sm">
                                            <div className="relative h-16 bg-muted flex items-center justify-center">
                                              <div
                                                className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[getAlertStatus(machine)]} z-10`}
                                              />
                                              {machine.imageUrl ? (
                                                <Image
                                                  src={machine.imageUrl}
                                                  alt={machine.name}
                                                  fill
                                                  className="object-cover"
                                                  sizes="160px"
                                                />
                                              ) : (
                                                <Box className="w-8 h-8 text-muted-foreground" />
                                              )}
                                            </div>
                                            <div className="px-2 py-2 border-t bg-background">
                                              <p className="text-xs font-medium text-center line-clamp-1">
                                                {machine.name}
                                              </p>
                                              <MachineSectionList machine={machine} />
                                            </div>
                                          </div>
                                          <MoveDown className="w-3 h-3 text-green-500 mt-1" />
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Production Line */}
                                  <div className="h-1.5 bg-green-500 rounded-full mx-2" />

                                  {/* Bottom row - odd indexed machines */}
                                  <div className="flex justify-center gap-4 mt-1">
                                    {filteredMachines.map((productionLineMachine, index) => {
                                      const machine = productionLineMachine.machine!;
                                      const isBottom = index % 2 === 1;
                                      if (!isBottom) {
                                        return (
                                          <div
                                            key={productionLineMachine.machineId}
                                            className="w-40"
                                          />
                                        );
                                      }
                                      return (
                                        <div
                                          key={productionLineMachine.machineId}
                                          className="flex flex-col items-center"
                                        >
                                          <MoveUp className="w-3 h-3 text-green-500 mb-1" />
                                          <div className="w-40 bg-background rounded-lg overflow-hidden border shadow-sm">
                                            <div className="relative h-16 bg-muted flex items-center justify-center">
                                              <div
                                                className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[getAlertStatus(machine)]} z-10`}
                                              />
                                              {machine.imageUrl ? (
                                                <Image
                                                  src={machine.imageUrl}
                                                  alt={machine.name}
                                                  fill
                                                  className="object-cover"
                                                  sizes="160px"
                                                />
                                              ) : (
                                                <Box className="w-8 h-8 text-muted-foreground" />
                                              )}
                                            </div>
                                            <div className="px-2 py-2 border-t bg-background">
                                              <p className="text-xs font-medium text-center line-clamp-1">
                                                {machine.name}
                                              </p>
                                              <MachineSectionList machine={machine} />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Mobile layout - vertical line */}
                              <div className="md:hidden py-4">
                                <div className="relative flex">
                                  {/* Vertical production line */}
                                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-green-500 rounded-full" />

                                  <div className="flex flex-col gap-4 pl-6">
                                    {filteredMachines.map((productionLineMachine) => {
                                      const machine = productionLineMachine.machine!;
                                      return (
                                        <div
                                          key={productionLineMachine.machineId}
                                          className="relative flex items-center"
                                        >
                                          {/* Connection dot */}
                                          <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-600 -translate-x-1/2" />
                                          {/* Connection line */}
                                          <div className="h-1 w-8 bg-green-500" />
                                          {/* Machine card */}
                                          <div className="flex-1 max-w-[200px] bg-background rounded-lg overflow-hidden border shadow-sm">
                                            <div className="relative h-14 bg-muted flex items-center justify-center">
                                              <div
                                                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${statusColors[getAlertStatus(machine)]} z-10`}
                                              />
                                              {machine.imageUrl ? (
                                                <Image
                                                  src={machine.imageUrl}
                                                  alt={machine.name}
                                                  fill
                                                  className="object-cover"
                                                  sizes="200px"
                                                />
                                              ) : (
                                                <Box className="w-6 h-6 text-muted-foreground" />
                                              )}
                                            </div>
                                            <div className="px-2 py-1.5 border-t bg-background">
                                              <p className="text-xs font-medium line-clamp-1">
                                                {machine.name}
                                              </p>
                                              <MachineSectionList machine={machine} />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="py-8 text-center">
                              <Factory className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                              <p className="text-sm text-muted-foreground mt-2">
                                {tProdLines('noMachinesConfigured')}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          {/* Pagination Dots */}
          {productionLines.length > 1 && (
            <div className="flex justify-center gap-2 py-2">
              {productionLines.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollTo(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === current
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
