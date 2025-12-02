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
                          <div onClick={(e) => e.stopPropagation()}>
                            <ViewTab productionLine={line} canViewMachineDetails={true} />
                          </div>
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
