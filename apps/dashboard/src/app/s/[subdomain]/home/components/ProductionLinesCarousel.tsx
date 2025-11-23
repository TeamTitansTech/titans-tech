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
import { Factory, ArrowRight, Box, MoveUp, Circle } from 'lucide-react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { getProductionLines } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import Image from 'next/image';
import {
  getAlertStatus,
  getSectionStatus,
  statusColors,
  sectionStatusColors,
} from '@/lib/alertStatus';

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

export function ProductionLinesCarousel() {
  const t = useTranslations('dashboard.client');
  const tProdLines = useTranslations('productionLines');
  const tMachines = useTranslations('machines');
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

              return (
                <CarouselItem key={line.id} className="pl-2 md:pl-4 basis-full">
                  <Card
                    className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                    onClick={() => handleCardClick(line.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
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
                          <div className="relative overflow-x-auto py-6">
                            <div className="flex items-end justify-center gap-4 min-w-max px-4">
                              {filteredMachines.map((productionLineMachine) => {
                                const machine = productionLineMachine.machine!;
                                const sections = machine.blueprint?.sections || [];
                                return (
                                  <div
                                    key={productionLineMachine.machineId}
                                    className="relative flex flex-col items-center"
                                  >
                                    {/* Machine Card */}
                                    <div className="w-32 bg-muted rounded-md overflow-hidden border">
                                      <div className="relative aspect-square bg-muted flex items-center justify-center">
                                        {/* Status Indicator Circle */}
                                        <div
                                          className={`absolute top-2 right-2 w-3 h-3 rounded-full border ${statusColors[getAlertStatus(machine)]} z-10`}
                                        />
                                        {machine.imageUrl ? (
                                          <Image
                                            src={machine.imageUrl}
                                            alt={machine.name}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                          />
                                        ) : (
                                          <Box className="w-8 h-8 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="p-2 border-t bg-background">
                                        <p className="text-xs font-medium text-center line-clamp-1">
                                          {machine.name}
                                        </p>
                                      </div>

                                      {/* Status badges for sections */}
                                      {sections.length > 0 && (
                                        <div className="px-2 pb-2 space-y-1 border-t pt-2 bg-background">
                                          {sections.map((section) => {
                                            const status = getSectionStatus(section, machine);
                                            const sectionName = tMachines(
                                              `sectionNames.${SECTION_I18N_KEYS[section] || 'unknown'}`,
                                            );
                                            return (
                                              <div
                                                key={section}
                                                className="flex items-center gap-1 text-xs"
                                              >
                                                <Circle
                                                  className={`w-2 h-2 fill-current ${sectionStatusColors[status]}`}
                                                />
                                                <span className="truncate">{sectionName}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Arrow pointing to line */}
                                    <div className="flex flex-col items-center mt-2">
                                      <MoveUp className="w-4 h-4 text-green-500" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Production Line */}
                            <div className="relative h-1 mt-1">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 rounded-full" />
                            </div>
                          </div>
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
  );
}
