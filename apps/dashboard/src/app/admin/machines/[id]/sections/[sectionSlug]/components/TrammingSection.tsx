'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { TrammingInspectionData } from './TrammingSectionWrapper';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';

interface TrammingSectionProps {
  machineId: string;
  inspections: TrammingInspectionData[];
  machineName: string;
}

export function TrammingSection({ inspections, machineName }: TrammingSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayUnit, setDisplayUnit] = useState<'mm' | 'in'>('in');
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

  // Conversion constants and functions
  const MM_PER_INCH = 25.4;

  const convertValue = useCallback(
    (value: number | null | undefined): number | null | undefined => {
      if (value === null || value === undefined) return value;
      if (displayUnit === 'mm') {
        return value * MM_PER_INCH;
      }
      return value;
    },
    [displayUnit],
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

  // Filter inspections to only include those with tramming data
  const inspectionsWithTrammingData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) => inspection.tramming?.[0]?.outerData || inspection.tramming?.[0]?.innerData,
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has tramming data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithTrammingData[0];
  }, [inspectionsWithTrammingData]);

  const latestOuterData = latestInspectionWithData?.tramming?.[0]?.outerData;
  const latestInnerData = latestInspectionWithData?.tramming?.[0]?.innerData;
  const latestSlideTram = latestInspectionWithData?.tramming?.[0]?.slideTram;
  const latestNotes = latestInspectionWithData?.tramming?.[0]?.notes;

  const formatValue = (value: number | null | undefined, decimals = 3): string => {
    if (value === null || value === undefined) return '-';
    const converted = convertValue(value);
    if (converted === null || converted === undefined) return '-';
    const numValue = Number(converted);
    if (isNaN(numValue)) return '-';
    return numValue.toFixed(decimals);
  };

  const renderTrammingDisplay = (
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

        {/* Center trim pin circle */}
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
  const outerChartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.tramming?.[0]?.outerData)
      .map((inspection) => {
        const data = inspection.tramming[0]!.outerData!;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          topTop: Number(convertValue(Number(data.topTop))) || 0,
          topBottom: Number(convertValue(Number(data.topBottom))) || 0,
          topLeft: Number(convertValue(Number(data.topLeft))) || 0,
          topRight: Number(convertValue(Number(data.topRight))) || 0,
          bottomTop: Number(convertValue(Number(data.bottomTop))) || 0,
          bottomBottom: Number(convertValue(Number(data.bottomBottom))) || 0,
          bottomLeft: Number(convertValue(Number(data.bottomLeft))) || 0,
          bottomRight: Number(convertValue(Number(data.bottomRight))) || 0,
          leftTop: Number(convertValue(Number(data.leftTop))) || 0,
          leftBottom: Number(convertValue(Number(data.leftBottom))) || 0,
          leftLeft: Number(convertValue(Number(data.leftLeft))) || 0,
          leftRight: Number(convertValue(Number(data.leftRight))) || 0,
          rightTop: Number(convertValue(Number(data.rightTop))) || 0,
          rightBottom: Number(convertValue(Number(data.rightBottom))) || 0,
          rightLeft: Number(convertValue(Number(data.rightLeft))) || 0,
          rightRight: Number(convertValue(Number(data.rightRight))) || 0,
        };
      })
      .reverse();
  }, [filteredInspections, convertValue]);

  // Transform data for charts - Inner measurements
  const innerChartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.tramming?.[0]?.innerData)
      .map((inspection) => {
        const data = inspection.tramming[0]!.innerData!;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          topTop: Number(convertValue(Number(data.topTop))) || 0,
          topBottom: Number(convertValue(Number(data.topBottom))) || 0,
          topLeft: Number(convertValue(Number(data.topLeft))) || 0,
          topRight: Number(convertValue(Number(data.topRight))) || 0,
          bottomTop: Number(convertValue(Number(data.bottomTop))) || 0,
          bottomBottom: Number(convertValue(Number(data.bottomBottom))) || 0,
          bottomLeft: Number(convertValue(Number(data.bottomLeft))) || 0,
          bottomRight: Number(convertValue(Number(data.bottomRight))) || 0,
          leftTop: Number(convertValue(Number(data.leftTop))) || 0,
          leftBottom: Number(convertValue(Number(data.leftBottom))) || 0,
          leftLeft: Number(convertValue(Number(data.leftLeft))) || 0,
          leftRight: Number(convertValue(Number(data.leftRight))) || 0,
          rightTop: Number(convertValue(Number(data.rightTop))) || 0,
          rightBottom: Number(convertValue(Number(data.rightBottom))) || 0,
          rightLeft: Number(convertValue(Number(data.rightLeft))) || 0,
          rightRight: Number(convertValue(Number(data.rightRight))) || 0,
        };
      })
      .reverse();
  }, [filteredInspections, convertValue]);

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
            <Typography variant="large">{inspectionsWithTrammingData.length}</Typography>
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
            <CardTitle>{t('sectionTitles.trammingMeasurements')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={displayUnit === 'in' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDisplayUnit('in')}
                  className="h-7 px-3"
                >
                  in
                </Button>
                <Button
                  variant={displayUnit === 'mm' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDisplayUnit('mm')}
                  className="h-7 px-3"
                >
                  mm
                </Button>
              </div>
              <SectionExportButton
                contentRef={contentRef}
                sectionName="Tramming"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Slide Tram Field */}
          <div className="mb-8">
            <div className="space-y-1">
              <Typography variant="small" className="text-muted-foreground">
                {t('labels.slideTram')}
              </Typography>
              <Typography variant="large">{latestSlideTram || '-'}</Typography>
            </div>
          </div>

          {/* Outer Tramming Values */}
          <div className="mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.outer')} {t('labels.tramming')}
            </Typography>
            <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
              <div className="w-full max-w-4xl mx-auto">
                {/* Top - full width */}
                <div className="flex justify-center mb-8">
                  {renderTrammingDisplay(
                    t('labels.top'),
                    latestOuterData?.topTop,
                    latestOuterData?.topBottom,
                    latestOuterData?.topLeft,
                    latestOuterData?.topRight,
                  )}
                </div>

                {/* Left and Right - side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
                  {renderTrammingDisplay(
                    t('labels.left'),
                    latestOuterData?.leftTop,
                    latestOuterData?.leftBottom,
                    latestOuterData?.leftLeft,
                    latestOuterData?.leftRight,
                  )}
                  {renderTrammingDisplay(
                    t('labels.right'),
                    latestOuterData?.rightTop,
                    latestOuterData?.rightBottom,
                    latestOuterData?.rightLeft,
                    latestOuterData?.rightRight,
                  )}
                </div>

                {/* Bottom - full width */}
                <div className="flex justify-center">
                  {renderTrammingDisplay(
                    t('labels.bottom'),
                    latestOuterData?.bottomTop,
                    latestOuterData?.bottomBottom,
                    latestOuterData?.bottomLeft,
                    latestOuterData?.bottomRight,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inner Tramming Values */}
          <div className="mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.inner')} {t('labels.tramming')}
            </Typography>
            <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
              <div className="w-full max-w-4xl mx-auto">
                {/* Top - full width */}
                <div className="flex justify-center mb-8">
                  {renderTrammingDisplay(
                    t('labels.top'),
                    latestInnerData?.topTop,
                    latestInnerData?.topBottom,
                    latestInnerData?.topLeft,
                    latestInnerData?.topRight,
                  )}
                </div>

                {/* Left and Right - side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
                  {renderTrammingDisplay(
                    t('labels.left'),
                    latestInnerData?.leftTop,
                    latestInnerData?.leftBottom,
                    latestInnerData?.leftLeft,
                    latestInnerData?.leftRight,
                  )}
                  {renderTrammingDisplay(
                    t('labels.right'),
                    latestInnerData?.rightTop,
                    latestInnerData?.rightBottom,
                    latestInnerData?.rightLeft,
                    latestInnerData?.rightRight,
                  )}
                </div>

                {/* Bottom - full width */}
                <div className="flex justify-center">
                  {renderTrammingDisplay(
                    t('labels.bottom'),
                    latestInnerData?.bottomTop,
                    latestInnerData?.bottomBottom,
                    latestInnerData?.bottomLeft,
                    latestInnerData?.bottomRight,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6 mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.measurementTrends')}
            </Typography>

            {/* Outer Top Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.outerTopRowMeasurements')}
              data={outerChartData}
              lines={[
                { dataKey: 'topTop', label: t('labels.topTop'), color: '#8884d8' },
                { dataKey: 'topBottom', label: t('labels.topBottom'), color: '#06b6d4' },
                { dataKey: 'topLeft', label: t('labels.topLeft'), color: '#3b82f6' },
                { dataKey: 'topRight', label: t('labels.topRight'), color: '#ec4899' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Outer Bottom Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.outerBottomRowMeasurements')}
              data={outerChartData}
              lines={[
                { dataKey: 'bottomTop', label: t('labels.bottomTop'), color: '#10b981' },
                { dataKey: 'bottomBottom', label: t('labels.bottomBottom'), color: '#f59e0b' },
                { dataKey: 'bottomLeft', label: t('labels.bottomLeft'), color: '#ef4444' },
                { dataKey: 'bottomRight', label: t('labels.bottomRight'), color: '#8b5cf6' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Outer Left Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.outerLeftRowMeasurements')}
              data={outerChartData}
              lines={[
                { dataKey: 'leftTop', label: t('labels.leftTop'), color: '#8884d8' },
                { dataKey: 'leftBottom', label: t('labels.leftBottom'), color: '#06b6d4' },
                { dataKey: 'leftLeft', label: t('labels.leftLeft'), color: '#3b82f6' },
                { dataKey: 'leftRight', label: t('labels.leftRight'), color: '#ec4899' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Outer Right Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.outerRightRowMeasurements')}
              data={outerChartData}
              lines={[
                { dataKey: 'rightTop', label: t('labels.rightTop'), color: '#10b981' },
                { dataKey: 'rightBottom', label: t('labels.rightBottom'), color: '#f59e0b' },
                { dataKey: 'rightLeft', label: t('labels.rightLeft'), color: '#ef4444' },
                { dataKey: 'rightRight', label: t('labels.rightRight'), color: '#8b5cf6' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Inner Top Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.innerTopRowMeasurements')}
              data={innerChartData}
              lines={[
                { dataKey: 'topTop', label: t('labels.topTop'), color: '#8884d8' },
                { dataKey: 'topBottom', label: t('labels.topBottom'), color: '#06b6d4' },
                { dataKey: 'topLeft', label: t('labels.topLeft'), color: '#3b82f6' },
                { dataKey: 'topRight', label: t('labels.topRight'), color: '#ec4899' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Inner Bottom Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.innerBottomRowMeasurements')}
              data={innerChartData}
              lines={[
                { dataKey: 'bottomTop', label: t('labels.bottomTop'), color: '#10b981' },
                { dataKey: 'bottomBottom', label: t('labels.bottomBottom'), color: '#f59e0b' },
                { dataKey: 'bottomLeft', label: t('labels.bottomLeft'), color: '#ef4444' },
                { dataKey: 'bottomRight', label: t('labels.bottomRight'), color: '#8b5cf6' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Inner Left Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.innerLeftRowMeasurements')}
              data={innerChartData}
              lines={[
                { dataKey: 'leftTop', label: t('labels.leftTop'), color: '#8884d8' },
                { dataKey: 'leftBottom', label: t('labels.leftBottom'), color: '#06b6d4' },
                { dataKey: 'leftLeft', label: t('labels.leftLeft'), color: '#3b82f6' },
                { dataKey: 'leftRight', label: t('labels.leftRight'), color: '#ec4899' },
              ]}
              valueUnit={displayUnit}
              allowToggle={true}
              height={300}
            />

            {/* Inner Right Row Measurements Chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.innerRightRowMeasurements')}
              data={innerChartData}
              lines={[
                { dataKey: 'rightTop', label: t('labels.rightTop'), color: '#10b981' },
                { dataKey: 'rightBottom', label: t('labels.rightBottom'), color: '#f59e0b' },
                { dataKey: 'rightLeft', label: t('labels.rightLeft'), color: '#ef4444' },
                { dataKey: 'rightRight', label: t('labels.rightRight'), color: '#8b5cf6' },
              ]}
              valueUnit={displayUnit}
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
