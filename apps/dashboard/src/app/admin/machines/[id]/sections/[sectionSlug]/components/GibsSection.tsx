'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { GibsInspectionData } from './GibsSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformGibsToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getGibsThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SectionExportButton } from '@/components/shared/SectionExportButton';

interface GibsSectionProps {
  machineId: string;
  inspections: GibsInspectionData[];
  machineName: string;
  blueprintId: string;
  hideThresholdValues?: boolean;
}

interface GibsStageData {
  point1: number | null;
  point2: number | null;
  point3: number | null;
  point4: number | null;
  point5: number | null;
  point6: number | null;
  point7: number | null;
  point8: number | null;
  point9: number | null;
  point10: number | null;
  point11: number | null;
  point12: number | null;
  point13: number | null;
  point14: number | null;
  point15: number | null;
  point16: number | null;
}

export function GibsSection({
  inspections,
  machineName,
  blueprintId,
  hideThresholdValues = false,
}: GibsSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const contentRef = useRef<HTMLDivElement>(null);
  const tGibsFields = useTranslations('machines.gibsFields');
  const [usableThreshold, setUsableThreshold] = useState<ThresholdConfig | null>(null);
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (inspections?.length > 0) {
      const dates = inspections.map((i) => new Date(i.date));
      return {
        from: new Date(Math.min(...dates.map((d) => d.getTime()))),
        to: new Date(Math.max(...dates.map((d) => d.getTime()))),
      };
    }
    return undefined;
  });

  // Fetch threshold data
  useEffect(() => {
    async function fetchThreshold() {
      if (!blueprintId) {
        return;
      }

      try {
        const response = await getGibsThresholdByBlueprint(blueprintId);
        if (response.data) {
          const threshold = extractThresholdConfig(response.data, 'usable');
          setUsableThreshold(threshold);
        }
      } catch (error) {
        console.error('Failed to fetch gibs threshold:', error);
      }
    }
    fetchThreshold();
  }, [blueprintId]);

  const filteredInspections = useMemo(() => {
    const filtered =
      inspections?.filter((inspection) => {
        const inspectionDate = new Date(inspection.date);
        if (date?.from && inspectionDate < date.from) return false;
        if (date?.to && inspectionDate > date.to) return false;
        return true;
      }) ?? [];

    // Sort by date descending so latest is first
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections, date]);

  const latestInspection = filteredInspections[0];
  const latestOuterData = latestInspection?.gibs?.[0]?.outerData;
  const latestInnerData = latestInspection?.gibs?.[0]?.innerData;

  // Transform data for charts
  const innerGibsChartData = useMemo(() => {
    return transformGibsToMultiLineData(filteredInspections, 'innerData');
  }, [filteredInspections]);

  const outerGibsChartData = useMemo(() => {
    return transformGibsToMultiLineData(filteredInspections, 'outerData');
  }, [filteredInspections]);

  // Combined usable data for the threshold chart
  const usableChartData = useMemo(() => {
    // Combine inner and outer usable values by date
    const dataByDate = new Map<string, { innerUsable?: number; outerUsable?: number }>();

    const getDateKey = (date: string | Date): string =>
      typeof date === 'string' ? date : date.toISOString();

    innerGibsChartData.forEach((item) => {
      const dateKey = getDateKey(item.date);
      const existing = dataByDate.get(dateKey) || {};
      dataByDate.set(dateKey, { ...existing, innerUsable: item.usable as number });
    });

    outerGibsChartData.forEach((item) => {
      const dateKey = getDateKey(item.date);
      const existing = dataByDate.get(dateKey) || {};
      dataByDate.set(dateKey, { ...existing, outerUsable: item.usable as number });
    });

    return Array.from(dataByDate.entries()).map(([date, values]) => ({
      date,
      innerUsable: values.innerUsable ?? 0,
      outerUsable: values.outerUsable ?? 0,
    }));
  }, [innerGibsChartData, outerGibsChartData]);

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(decimals);
  };

  // Calculate gibs fields from stage data
  const calculateGibsFields = (stageData: GibsStageData | null | undefined) => {
    if (!stageData) return null;

    // Convert to number, handling Prisma Decimal strings
    const toNum = (val: number | string | null | undefined) => {
      if (val === null || val === undefined) return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };
    // Check if value is a valid number (including string numbers from Prisma Decimal)
    const isNum = (val: number | string | null | undefined): boolean => {
      if (val === null || val === undefined) return false;
      const num = Number(val);
      return !isNaN(num);
    };

    const frontTop = toNum(stageData.point1) + toNum(stageData.point2);
    const frontBottom = toNum(stageData.point3) + toNum(stageData.point4);
    const backTop = toNum(stageData.point5) + toNum(stageData.point6);
    const backBottom = toNum(stageData.point7) + toNum(stageData.point8);
    const leftTop = toNum(stageData.point9) + toNum(stageData.point13);
    const leftBottom = toNum(stageData.point11) + toNum(stageData.point15);
    const rightTop = toNum(stageData.point10) + toNum(stageData.point14);
    const rightBottom = toNum(stageData.point12) + toNum(stageData.point16);

    const topPointsCount = [
      stageData.point9,
      stageData.point10,
      stageData.point13,
      stageData.point14,
    ].filter(isNum).length;
    const bottomPointsCount = [
      stageData.point11,
      stageData.point12,
      stageData.point15,
      stageData.point16,
    ].filter(isNum).length;

    let usable: number | undefined;

    if (topPointsCount === 4 && bottomPointsCount === 4) {
      const minLeft = Math.min(
        toNum(stageData.point9),
        toNum(stageData.point11),
        toNum(stageData.point13),
        toNum(stageData.point15),
      );
      const minRight = Math.min(
        toNum(stageData.point10),
        toNum(stageData.point12),
        toNum(stageData.point14),
        toNum(stageData.point16),
      );
      usable = minLeft + minRight;
    } else if (topPointsCount === 4) {
      const minTopLeft = Math.min(toNum(stageData.point9), toNum(stageData.point13));
      const minTopRight = Math.min(toNum(stageData.point10), toNum(stageData.point14));
      usable = minTopLeft + minTopRight;
    } else if (bottomPointsCount === 4) {
      const minBottomLeft = Math.min(toNum(stageData.point11), toNum(stageData.point15));
      const minBottomRight = Math.min(toNum(stageData.point12), toNum(stageData.point16));
      usable = minBottomLeft + minBottomRight;
    }

    return {
      frontTop,
      frontBottom,
      backTop,
      backBottom,
      leftTop,
      leftBottom,
      rightTop,
      rightBottom,
      usable,
    };
  };

  const outerCalculated = calculateGibsFields(latestOuterData);
  const innerCalculated = calculateGibsFields(latestInnerData);

  // Check if we have front-to-back or left-to-right data
  const hasOuterFrontToBack = latestOuterData
    ? [1, 2, 3, 4, 5, 6, 7, 8].some(
        (i) => latestOuterData[`point${i}` as keyof GibsStageData] !== null,
      )
    : false;
  const hasOuterLeftToRight = latestOuterData
    ? [9, 10, 11, 12, 13, 14, 15, 16].some(
        (i) => latestOuterData[`point${i}` as keyof GibsStageData] !== null,
      )
    : false;
  const hasInnerFrontToBack = latestInnerData
    ? [1, 2, 3, 4, 5, 6, 7, 8].some(
        (i) => latestInnerData[`point${i}` as keyof GibsStageData] !== null,
      )
    : false;
  const hasInnerLeftToRight = latestInnerData
    ? [9, 10, 11, 12, 13, 14, 15, 16].some(
        (i) => latestInnerData[`point${i}` as keyof GibsStageData] !== null,
      )
    : false;

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('press')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="large">{machineName || '-'}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('lastDateMeasurement')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="large">
              {latestInspection ? format(new Date(latestInspection.date), 'dd/MM/yyyy') : '-'}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalMeasurements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="large">{filteredInspections.length}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dateRange')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  size="sm"
                  className={cn(
                    'w-full justify-start text-left font-normal h-8 pr-3',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3 shrink-0" />
                  {date?.from ? (
                    date.to ? (
                      <span className="text-xs truncate">
                        {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                      </span>
                    ) : (
                      <span className="text-xs truncate">{format(date.from, 'dd/MM/yyyy')}</span>
                    )
                  ) : (
                    <span className="text-xs truncate">{t('pickDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('sectionTitles.gibsMeasurements')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="Gibs"
              machineName={machineName}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Outer Gibs */}
          {latestOuterData && (
            <div className="mb-8">
              <Typography variant="h4" className="mb-4">
                {t('labels.outer')} Gibs
              </Typography>

              {/* Usable Value */}
              {outerCalculated?.usable !== undefined && (
                <div className="border rounded-md p-3 bg-muted/30 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Usable Value</span>
                    <span className="font-medium text-lg">
                      {formatValue(outerCalculated.usable)}
                    </span>
                  </div>
                </div>
              )}

              {/* Front to Back Points (1-8) with diagram */}
              {hasOuterFrontToBack && (
                <div className="border rounded-md overflow-hidden mb-4">
                  <div className="bg-muted/30 px-4 py-2 font-semibold">
                    {tGibsFields('frontToBackTitle')}
                  </div>
                  <div className="grid grid-cols-7 items-center p-4">
                    {/* Left column - points 2,1,4,3 */}
                    <div className="space-y-3">
                      {[2, 1, 4, 3].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestOuterData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Center - image */}
                    <div className="col-span-5 h-full flex justify-center items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/gibs/front-to-back.png"
                        alt="GIBS measurement diagram"
                        className="aspect-square max-h-[200px]"
                      />
                    </div>

                    {/* Right column - points 6,5,8,7 */}
                    <div className="space-y-3">
                      {[6, 5, 8, 7].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestOuterData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Left to Right Points (9-16) with diagram */}
              {hasOuterLeftToRight && (
                <div className="border rounded-md overflow-hidden mb-4">
                  <div className="bg-muted/30 px-4 py-2 font-semibold">
                    {tGibsFields('leftToRightTitle')}
                  </div>
                  <div className="grid grid-cols-7 items-center p-4">
                    {/* Left column - points 13,9,15,11 */}
                    <div className="space-y-3">
                      {[13, 9, 15, 11].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestOuterData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Center - image */}
                    <div className="col-span-5 h-full flex justify-center items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/gibs/left-to-right.png"
                        alt="GIBS Left-to-Right measurement diagram"
                        className="aspect-square max-h-[200px]"
                      />
                    </div>

                    {/* Right column - points 14,10,16,12 */}
                    <div className="space-y-3">
                      {[14, 10, 16, 12].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestOuterData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inner Gibs */}
          {latestInnerData && (
            <div className="mb-8">
              <Typography variant="h4" className="mb-4">
                {t('labels.inner')} Gibs
              </Typography>

              {/* Usable Value */}
              {innerCalculated?.usable !== undefined && (
                <div className="border rounded-md p-3 bg-muted/30 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Usable Value</span>
                    <span className="font-medium text-lg">
                      {formatValue(innerCalculated.usable)}
                    </span>
                  </div>
                </div>
              )}

              {/* Front to Back Points (1-8) with diagram */}
              {hasInnerFrontToBack && (
                <div className="border rounded-md overflow-hidden mb-4">
                  <div className="bg-muted/30 px-4 py-2 font-semibold">
                    {tGibsFields('frontToBackTitle')}
                  </div>
                  <div className="grid grid-cols-7 items-center p-4">
                    {/* Left column - points 2,1,4,3 */}
                    <div className="space-y-3">
                      {[2, 1, 4, 3].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestInnerData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Center - image */}
                    <div className="col-span-5 h-full flex justify-center items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/gibs/front-to-back.png"
                        alt="GIBS measurement diagram"
                        className="aspect-square max-h-[200px]"
                      />
                    </div>

                    {/* Right column - points 6,5,8,7 */}
                    <div className="space-y-3">
                      {[6, 5, 8, 7].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestInnerData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Left to Right Points (9-16) with diagram */}
              {hasInnerLeftToRight && (
                <div className="border rounded-md overflow-hidden mb-4">
                  <div className="bg-muted/30 px-4 py-2 font-semibold">
                    {tGibsFields('leftToRightTitle')}
                  </div>
                  <div className="grid grid-cols-7 items-center p-4">
                    {/* Left column - points 13,9,15,11 */}
                    <div className="space-y-3">
                      {[13, 9, 15, 11].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestInnerData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Center - image */}
                    <div className="col-span-5 h-full flex justify-center items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/gibs/left-to-right.png"
                        alt="GIBS Left-to-Right measurement diagram"
                        className="aspect-square max-h-[200px]"
                      />
                    </div>

                    {/* Right column - points 14,10,16,12 */}
                    <div className="space-y-3">
                      {[14, 10, 16, 12].map((pointNum) => (
                        <div key={pointNum}>
                          <div className="text-xs text-muted-foreground mb-1">Point {pointNum}</div>
                          <div className="font-medium">
                            {formatValue(
                              latestInnerData[`point${pointNum}` as keyof GibsStageData] as number,
                              3,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          <div className="space-y-6">
            {/* Usable Value Chart - with threshold */}
            {usableChartData.length > 0 && (
              <MultiLineThresholdChart
                title={t('chartTitles.gibsUsableValue')}
                data={usableChartData}
                lines={[
                  ...(innerGibsChartData.length > 0
                    ? [{ dataKey: 'innerUsable', label: 'Inner Usable', color: '#8884d8' }]
                    : []),
                  ...(outerGibsChartData.length > 0
                    ? [{ dataKey: 'outerUsable', label: 'Outer Usable', color: '#06b6d4' }]
                    : []),
                ]}
                sharedThreshold={usableThreshold}
                valueUnit="mm"
                allowToggle={true}
                hideThresholdValues={hideThresholdValues}
                height={300}
              />
            )}

            {/* Inner Gibs - Directional Sums (no threshold) */}
            {innerGibsChartData.length > 0 && (
              <MultiLineThresholdChart
                title={t('chartTitles.innerGibsDirectional')}
                data={innerGibsChartData}
                lines={[
                  { dataKey: 'leftTop', label: 'Front Top', color: '#8884d8' },
                  { dataKey: 'leftBottom', label: 'Front Bottom', color: '#06b6d4' },
                  { dataKey: 'rightTop', label: 'Back Top', color: '#3b82f6' },
                  { dataKey: 'rightBottom', label: 'Back Bottom', color: '#ec4899' },
                ]}
                valueUnit="mm"
                allowToggle={false}
                height={300}
              />
            )}

            {/* Outer Gibs - Directional Sums (no threshold) */}
            {outerGibsChartData.length > 0 && (
              <MultiLineThresholdChart
                title={t('chartTitles.outerGibsDirectional')}
                data={outerGibsChartData}
                lines={[
                  { dataKey: 'leftTop', label: 'Front Top', color: '#8884d8' },
                  { dataKey: 'leftBottom', label: 'Front Bottom', color: '#06b6d4' },
                  { dataKey: 'rightTop', label: 'Back Top', color: '#3b82f6' },
                  { dataKey: 'rightBottom', label: 'Back Bottom', color: '#ec4899' },
                ]}
                valueUnit="mm"
                allowToggle={false}
                height={300}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
