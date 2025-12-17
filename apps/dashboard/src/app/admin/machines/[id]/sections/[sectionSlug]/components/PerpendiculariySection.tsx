'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useState, useMemo, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { PerpendicularityInspectionData } from './PerpendiculariySectionWrapper';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';

interface PerpendicularitySectionProps {
  machineId: string;
  inspections: PerpendicularityInspectionData[];
  machineName: string;
}

export function PerpendiculariySection({ inspections, machineName }: PerpendicularitySectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const contentRef = useRef<HTMLDivElement>(null);
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

  // Convert value based on display unit (data stored in mm)
  const convertValue = useCallback(
    (value: number | null | undefined): number | null | undefined => {
      if (value === null || value === undefined) return value;
      return convertLengthFromDefault(value);
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

  // Filter inspections to only include those with perpendicularity data
  const inspectionsWithData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) =>
        inspection.perpendicularity?.[0]?.beforeFR !== null ||
        inspection.perpendicularity?.[0]?.beforeLR !== null ||
        inspection.perpendicularity?.[0]?.afterFR !== null ||
        inspection.perpendicularity?.[0]?.afterLR !== null,
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has perpendicularity data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithData[0];
  }, [inspectionsWithData]);

  const latestData = latestInspectionWithData?.perpendicularity?.[0];

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    const converted = convertValue(value);
    if (converted === null || converted === undefined) return '-';
    const numValue = Number(converted);
    if (isNaN(numValue)) return '-';
    return numValue.toFixed(decimals);
  };

  const getAdjustedBadge = (value: string | null | undefined) => {
    if (!value) return null;
    switch (value) {
      case 'YES':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('labels.yes')}
          </Badge>
        );
      case 'NO':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t('labels.no')}
          </Badge>
        );
      case 'DNC':
        return (
          <Badge variant="secondary">
            <MinusCircle className="w-3 h-3 mr-1" />
            {t('labels.dnc')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  };

  // Transform data for charts
  const chartData = useMemo(() => {
    return filteredInspections
      .filter(
        (inspection) =>
          inspection.perpendicularity?.[0] &&
          (inspection.perpendicularity[0].beforeFR !== null ||
            inspection.perpendicularity[0].beforeLR !== null ||
            inspection.perpendicularity[0].afterFR !== null ||
            inspection.perpendicularity[0].afterLR !== null),
      )
      .map((inspection) => {
        const data = inspection.perpendicularity[0];
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          beforeFR: data.beforeFR !== null ? Number(convertValue(Number(data.beforeFR))) || 0 : 0,
          beforeLR: data.beforeLR !== null ? Number(convertValue(Number(data.beforeLR))) || 0 : 0,
          afterFR: data.afterFR !== null ? Number(convertValue(Number(data.afterFR))) || 0 : 0,
          afterLR: data.afterLR !== null ? Number(convertValue(Number(data.afterLR))) || 0 : 0,
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
            <Typography variant="large">{inspectionsWithData.length}</Typography>
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
            <CardTitle>{t('sectionTitles.perpendicularityMeasurements')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={lengthUnit === 'inches' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLengthUnit('inches')}
                  className="h-7 px-3"
                >
                  in
                </Button>
                <Button
                  variant={lengthUnit === 'mm' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLengthUnit('mm')}
                  className="h-7 px-3"
                >
                  mm
                </Button>
              </div>
              <SectionExportButton
                contentRef={contentRef}
                sectionName="Perpendicularity"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inspectionsWithData.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="muted">{t('labels.noPerpendicularityData')}</Typography>
            </div>
          ) : (
            <>
              {/* Adjustment Status */}
              <div className="mb-8">
                <div className="space-y-1">
                  <Typography variant="small" className="text-muted-foreground">
                    {t('labels.hasBeenAdjusted')}
                  </Typography>
                  <div>{getAdjustedBadge(latestData?.hasBeenAdjusted)}</div>
                </div>
              </div>

              {/* Before/After Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Before Adjustment */}
                <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
                  <Typography variant="h4" className="mb-4">
                    {t('labels.beforeAdjustment')}
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Typography variant="small" className="text-muted-foreground">
                        {t('labels.frontRear')}
                      </Typography>
                      <Typography variant="large">
                        {formatValue(latestData?.beforeFR)} {getLengthUnitLabel()}
                      </Typography>
                    </div>
                    <div className="space-y-1">
                      <Typography variant="small" className="text-muted-foreground">
                        {t('labels.leftRight')}
                      </Typography>
                      <Typography variant="large">
                        {formatValue(latestData?.beforeLR)} {getLengthUnitLabel()}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* After Adjustment */}
                <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
                  <Typography variant="h4" className="mb-4">
                    {t('labels.afterAdjustment')}
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Typography variant="small" className="text-muted-foreground">
                        {t('labels.frontRear')}
                      </Typography>
                      <Typography variant="large">
                        {formatValue(latestData?.afterFR)} {getLengthUnitLabel()}
                      </Typography>
                    </div>
                    <div className="space-y-1">
                      <Typography variant="small" className="text-muted-foreground">
                        {t('labels.leftRight')}
                      </Typography>
                      <Typography variant="large">
                        {formatValue(latestData?.afterLR)} {getLengthUnitLabel()}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {chartData.length > 0 && (
                <div className="space-y-6 mb-8">
                  <Typography variant="h4" className="mb-4">
                    {t('labels.measurementTrends')}
                  </Typography>

                  {/* Before Adjustment Chart */}
                  <MultiLineThresholdChart
                    title={t('chartTitles.beforeAdjustmentTrend')}
                    data={chartData}
                    lines={[
                      { dataKey: 'beforeFR', label: t('labels.frontRear'), color: '#8884d8' },
                      { dataKey: 'beforeLR', label: t('labels.leftRight'), color: '#06b6d4' },
                    ]}
                    valueUnit={getLengthUnitLabel()}
                    allowToggle={true}
                    height={300}
                  />

                  {/* After Adjustment Chart */}
                  <MultiLineThresholdChart
                    title={t('chartTitles.afterAdjustmentTrend')}
                    data={chartData}
                    lines={[
                      { dataKey: 'afterFR', label: t('labels.frontRear'), color: '#10b981' },
                      { dataKey: 'afterLR', label: t('labels.leftRight'), color: '#f59e0b' },
                    ]}
                    valueUnit={getLengthUnitLabel()}
                    allowToggle={true}
                    height={300}
                  />
                </div>
              )}

              {/* Notes */}
              {latestData?.notes && (
                <div className="mt-6">
                  <Typography variant="h4" className="mb-2">
                    {t('labels.notes')}
                  </Typography>
                  <Card>
                    <CardContent className="pt-4">
                      <Typography variant="p">{latestData.notes}</Typography>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
