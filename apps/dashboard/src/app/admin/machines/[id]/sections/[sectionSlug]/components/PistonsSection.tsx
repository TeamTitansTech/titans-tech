'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { PistonsInspectionData } from './PistonsSectionWrapper';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import { extractThresholdConfig } from '@/components/charts/dataTransformers';
import { getPistonsThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';

interface PistonsSectionProps {
  machineId: string;
  inspections: PistonsInspectionData[];
  machineName: string;
  blueprintId: string;
}

interface PistonsChartDataPoint {
  date: string;
  lhTop: number;
  lhBottom: number;
  lhLeft: number;
  lhRight: number;
  rhTop: number;
  rhBottom: number;
  rhLeft: number;
  rhRight: number;
  [key: string]: string | number;
}

export function PistonsSection({ inspections, machineName, blueprintId }: PistonsSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const contentRef = useRef<HTMLDivElement>(null);

  // Single threshold for all positions (difference threshold)
  const [differenceThreshold, setDifferenceThreshold] = useState<ThresholdConfig | null>(null);

  const { lengthUnit, setLengthUnit, convertLengthFromDefault, getLengthUnitLabel } =
    useUnitManager();

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
    async function fetchThresholds() {
      if (!blueprintId) {
        return;
      }

      try {
        const response = await getPistonsThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract single difference threshold (used for all positions)
          setDifferenceThreshold(extractThresholdConfig(response.data, 'difference'));
        }
      } catch (error) {
        console.error('Failed to fetch pistons thresholds:', error);
      }
    }
    fetchThresholds();
  }, [blueprintId]);

  // Convert value based on display unit (data stored in mm)
  const convertValue = useCallback(
    (value: number | null): number | null => {
      if (value === null) return null;
      return convertLengthFromDefault(value);
    },
    [convertLengthFromDefault],
  );

  // Convert threshold based on display unit (thresholds stored in mm)
  const convertThreshold = useCallback(
    (threshold: ThresholdConfig | null): ThresholdConfig | null => {
      if (!threshold) return null;
      return {
        greenMin: convertLengthFromDefault(threshold.greenMin),
        yellowMin: convertLengthFromDefault(threshold.yellowMin),
        redMin: convertLengthFromDefault(threshold.redMin),
        label: threshold.label,
      };
    },
    [convertLengthFromDefault],
  );

  // Convert chart data based on display unit (data stored in mm)
  const convertChartData = useCallback(
    (data: PistonsChartDataPoint[], keys: string[]): PistonsChartDataPoint[] => {
      return data.map((point) => {
        const converted = { ...point };
        keys.forEach((key) => {
          const val = point[key as keyof PistonsChartDataPoint];
          if (typeof val === 'number') {
            (converted as Record<string, unknown>)[key] = convertLengthFromDefault(val);
          }
        });
        return converted;
      });
    },
    [convertLengthFromDefault],
  );

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

  // Filter inspections to only those that have pistons data
  const inspectionsWithPistonsData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) => inspection.pistons?.[0]?.outerData || inspection.pistons?.[0]?.innerData,
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has pistons data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithPistonsData[0];
  }, [inspectionsWithPistonsData]);

  const latestOuterData = latestInspectionWithData?.pistons?.[0]?.outerData;
  const latestInnerData = latestInspectionWithData?.pistons?.[0]?.innerData;
  const latestGuideSeals = latestInspectionWithData?.pistons?.[0]?.guideSeals;
  const latestPistonSeals = latestInspectionWithData?.pistons?.[0]?.pistonSeals;
  const latestVacuumSystem = latestInspectionWithData?.pistons?.[0]?.vacuumSystem;
  const latestVacuumPressure =
    latestInspectionWithData?.pistons?.[0]?.vacuumSystemAirPressureSetting;
  const latestNotes = latestInspectionWithData?.pistons?.[0]?.notes;

  const formatValue = (value: number | null | undefined, decimals = 3): string => {
    if (value === null || value === undefined) return '-';
    const numValue = Number(value);
    if (isNaN(numValue)) return '-';
    const converted = convertValue(numValue);
    if (converted === null) return '-';
    return converted.toFixed(decimals);
  };

  const renderPistonDisplay = (
    label: string,
    topValue: number | null | undefined,
    bottomValue: number | null | undefined,
    leftValue: number | null | undefined,
    rightValue: number | null | undefined,
  ) => (
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-semibold mb-1">{label}</Label>
      <div className="relative flex items-center justify-center p-10">
        {/* Top value */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(topValue)}
            </Typography>
          </div>
        </div>

        {/* Left value */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(leftValue)}
            </Typography>
          </div>
        </div>

        {/* Center piston circle */}
        <div className="w-10 h-10 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center mx-2">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
        </div>

        {/* Right value */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(rightValue)}
            </Typography>
          </div>
        </div>

        {/* Bottom value */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(bottomValue)}
            </Typography>
          </div>
        </div>

        {/* Grid lines - horizontal and vertical through center */}
        <div className="absolute top-1/2 -translate-y-1/2 left-16 right-16 h-[1px] bg-border/30" />
        <div className="absolute left-1/2 -translate-x-1/2 top-16 bottom-16 w-[1px] bg-border/30" />
      </div>
    </div>
  );

  // Transform data for charts - Outer measurements
  const outerChartData: PistonsChartDataPoint[] = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.pistons?.[0]?.outerData)
      .map((inspection) => {
        const data = inspection.pistons[0]!.outerData!;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          lhTop: Number(data.lhTop) || 0,
          lhBottom: Number(data.lhBottom) || 0,
          lhLeft: Number(data.lhLeft) || 0,
          lhRight: Number(data.lhRight) || 0,
          rhTop: Number(data.rhTop) || 0,
          rhBottom: Number(data.rhBottom) || 0,
          rhLeft: Number(data.rhLeft) || 0,
          rhRight: Number(data.rhRight) || 0,
        };
      })
      .reverse();
  }, [filteredInspections]);

  // Transform data for charts - Inner measurements
  const innerChartData: PistonsChartDataPoint[] = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.pistons?.[0]?.innerData)
      .map((inspection) => {
        const data = inspection.pistons[0]!.innerData!;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          lhTop: Number(data.lhTop) || 0,
          lhBottom: Number(data.lhBottom) || 0,
          lhLeft: Number(data.lhLeft) || 0,
          lhRight: Number(data.lhRight) || 0,
          rhTop: Number(data.rhTop) || 0,
          rhBottom: Number(data.rhBottom) || 0,
          rhLeft: Number(data.rhLeft) || 0,
          rhRight: Number(data.rhRight) || 0,
        };
      })
      .reverse();
  }, [filteredInspections]);

  // Get converted threshold (single threshold used for all positions)
  const convertedThreshold = useMemo(
    () => convertThreshold(differenceThreshold),
    [convertThreshold, differenceThreshold],
  );

  // Get converted chart data
  const outerChartDataConverted = useMemo(() => {
    const keys = [
      'lhTop',
      'lhBottom',
      'lhLeft',
      'lhRight',
      'rhTop',
      'rhBottom',
      'rhLeft',
      'rhRight',
    ];
    return convertChartData(outerChartData, keys);
  }, [convertChartData, outerChartData]);

  const innerChartDataConverted = useMemo(() => {
    const keys = [
      'lhTop',
      'lhBottom',
      'lhLeft',
      'lhRight',
      'rhTop',
      'rhBottom',
      'rhLeft',
      'rhRight',
    ];
    return convertChartData(innerChartData, keys);
  }, [convertChartData, innerChartData]);

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
              {latestInspectionWithData
                ? format(new Date(latestInspectionWithData.date), 'dd/MM/yyyy')
                : '-'}
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
            <Typography variant="large">{inspectionsWithPistonsData.length}</Typography>
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
            <CardTitle>{t('sectionTitles.pistonsMeasurements')}</CardTitle>
            <div className="flex items-center gap-3">
              {/* Unit Toggle */}
              <div className="flex items-center rounded-md border">
                <Button
                  variant={lengthUnit === 'mm' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 rounded-r-none"
                  onClick={() => setLengthUnit('mm')}
                >
                  mm
                </Button>
                <Button
                  variant={lengthUnit === 'inches' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 rounded-l-none"
                  onClick={() => setLengthUnit('inches')}
                >
                  in
                </Button>
              </div>
              <SectionExportButton
                contentRef={contentRef}
                sectionName="Pistons"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Condition Fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="space-y-1">
              <Typography variant="small" className="text-muted-foreground">
                {t('labels.guideSeals')}
              </Typography>
              <Typography variant="large">{latestGuideSeals || '-'}</Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-muted-foreground">
                {t('labels.pistonSeals')}
              </Typography>
              <Typography variant="large">{latestPistonSeals || '-'}</Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-muted-foreground">
                {t('labels.vacuumSystem')}
              </Typography>
              <Typography variant="large">{latestVacuumSystem || '-'}</Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-muted-foreground">
                {t('labels.vacuumPressureSetting')}
              </Typography>
              <Typography variant="large">{formatValue(latestVacuumPressure)}</Typography>
            </div>
          </div>

          {/* Outer Pistons Values */}
          <div className="mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.outer')} {t('labels.pistons')}
            </Typography>
            <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
                {renderPistonDisplay(
                  'LH',
                  latestOuterData?.lhTop,
                  latestOuterData?.lhBottom,
                  latestOuterData?.lhLeft,
                  latestOuterData?.lhRight,
                )}
                {renderPistonDisplay(
                  'RH',
                  latestOuterData?.rhTop,
                  latestOuterData?.rhBottom,
                  latestOuterData?.rhLeft,
                  latestOuterData?.rhRight,
                )}
              </div>
            </div>
          </div>

          {/* Inner Pistons Values */}
          <div className="mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.inner')} {t('labels.pistons')}
            </Typography>
            <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
                {renderPistonDisplay(
                  'LH',
                  latestInnerData?.lhTop,
                  latestInnerData?.lhBottom,
                  latestInnerData?.lhLeft,
                  latestInnerData?.lhRight,
                )}
                {renderPistonDisplay(
                  'RH',
                  latestInnerData?.rhTop,
                  latestInnerData?.rhBottom,
                  latestInnerData?.rhLeft,
                  latestInnerData?.rhRight,
                )}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6 mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.measurementTrends')}
            </Typography>

            {/* Outer LH Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.outerLhMeasurements')}
              data={outerChartDataConverted}
              lines={[
                { dataKey: 'lhTop', label: t('labels.lhTop'), color: '#8884d8' },
                { dataKey: 'lhBottom', label: t('labels.lhBottom'), color: '#06b6d4' },
                { dataKey: 'lhLeft', label: t('labels.lhLeft'), color: '#3b82f6' },
                { dataKey: 'lhRight', label: t('labels.lhRight'), color: '#ec4899' },
              ]}
              sharedThreshold={convertedThreshold ?? undefined}
              valueUnit={getLengthUnitLabel()}
              allowToggle={true}
              height={300}
            />

            {/* Outer RH Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.outerRhMeasurements')}
              data={outerChartDataConverted}
              lines={[
                { dataKey: 'rhTop', label: t('labels.rhTop'), color: '#10b981' },
                { dataKey: 'rhBottom', label: t('labels.rhBottom'), color: '#f59e0b' },
                { dataKey: 'rhLeft', label: t('labels.rhLeft'), color: '#ef4444' },
                { dataKey: 'rhRight', label: t('labels.rhRight'), color: '#8b5cf6' },
              ]}
              sharedThreshold={convertedThreshold ?? undefined}
              valueUnit={getLengthUnitLabel()}
              allowToggle={true}
              height={300}
            />

            {/* Inner LH Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.innerLhMeasurements')}
              data={innerChartDataConverted}
              lines={[
                { dataKey: 'lhTop', label: t('labels.lhTop'), color: '#8884d8' },
                { dataKey: 'lhBottom', label: t('labels.lhBottom'), color: '#06b6d4' },
                { dataKey: 'lhLeft', label: t('labels.lhLeft'), color: '#3b82f6' },
                { dataKey: 'lhRight', label: t('labels.lhRight'), color: '#ec4899' },
              ]}
              sharedThreshold={convertedThreshold ?? undefined}
              valueUnit={getLengthUnitLabel()}
              allowToggle={true}
              height={300}
            />

            {/* Inner RH Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.innerRhMeasurements')}
              data={innerChartDataConverted}
              lines={[
                { dataKey: 'rhTop', label: t('labels.rhTop'), color: '#10b981' },
                { dataKey: 'rhBottom', label: t('labels.rhBottom'), color: '#f59e0b' },
                { dataKey: 'rhLeft', label: t('labels.rhLeft'), color: '#ef4444' },
                { dataKey: 'rhRight', label: t('labels.rhRight'), color: '#8b5cf6' },
              ]}
              sharedThreshold={convertedThreshold ?? undefined}
              valueUnit={getLengthUnitLabel()}
              allowToggle={true}
              height={300}
            />
          </div>

          {/* Notes */}
          {latestNotes && (
            <div className="mt-6">
              <Typography variant="h4" className="mb-2">
                {t('labels.notes')}
              </Typography>
              <Card>
                <CardContent className="pt-4">
                  <Typography variant="p">{latestNotes}</Typography>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
