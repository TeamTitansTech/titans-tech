'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useState, useMemo, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { ShimThicknessInspectionData, ShimThicknessData } from './ShimThicknessSectionWrapper';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';

interface ShimThicknessSectionProps {
  machineId: string;
  inspections: ShimThicknessInspectionData[];
  machineName: string;
}

export function ShimThicknessSection({ inspections, machineName }: ShimThicknessSectionProps) {
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

  // Filter inspections to only include those with shim thickness data
  const inspectionsWithData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) =>
        inspection.shimThickness?.[0]?.outerLhData ||
        inspection.shimThickness?.[0]?.outerRhData ||
        inspection.shimThickness?.[0]?.innerLhData ||
        inspection.shimThickness?.[0]?.innerRhData,
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has shim thickness data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithData[0];
  }, [inspectionsWithData]);

  const latestData = latestInspectionWithData?.shimThickness?.[0];

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

  const renderShimDisplay = (label: string, data: ShimThicknessData | null | undefined) => (
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-semibold mb-1">{label}</Label>
      <div className="relative flex items-center justify-center p-10">
        {/* Top value */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(data?.top)}
            </Typography>
          </div>
        </div>

        {/* Left value */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(data?.left)}
            </Typography>
          </div>
        </div>

        {/* Center square */}
        <div className="w-10 h-10 border-2 border-foreground/30 bg-background flex items-center justify-center mx-2">
          <div className="w-1.5 h-1.5 bg-foreground/30" />
        </div>

        {/* Right value */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(data?.right)}
            </Typography>
          </div>
        </div>

        {/* Bottom value */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <div className="text-center">
            <Typography variant="small" className="font-medium">
              {formatValue(data?.bottom)}
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
      .filter(
        (inspection) =>
          inspection.shimThickness?.[0]?.outerLhData || inspection.shimThickness?.[0]?.outerRhData,
      )
      .map((inspection) => {
        const lhData = inspection.shimThickness[0]?.outerLhData;
        const rhData = inspection.shimThickness[0]?.outerRhData;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          outerLhTop: lhData?.top !== null ? Number(convertValue(Number(lhData?.top))) || 0 : 0,
          outerLhBottom:
            lhData?.bottom !== null ? Number(convertValue(Number(lhData?.bottom))) || 0 : 0,
          outerLhLeft: lhData?.left !== null ? Number(convertValue(Number(lhData?.left))) || 0 : 0,
          outerLhRight:
            lhData?.right !== null ? Number(convertValue(Number(lhData?.right))) || 0 : 0,
          outerRhTop: rhData?.top !== null ? Number(convertValue(Number(rhData?.top))) || 0 : 0,
          outerRhBottom:
            rhData?.bottom !== null ? Number(convertValue(Number(rhData?.bottom))) || 0 : 0,
          outerRhLeft: rhData?.left !== null ? Number(convertValue(Number(rhData?.left))) || 0 : 0,
          outerRhRight:
            rhData?.right !== null ? Number(convertValue(Number(rhData?.right))) || 0 : 0,
        };
      })
      .reverse();
  }, [filteredInspections, convertValue]);

  // Transform data for charts - Inner measurements
  const innerChartData = useMemo(() => {
    return filteredInspections
      .filter(
        (inspection) =>
          inspection.shimThickness?.[0]?.innerLhData || inspection.shimThickness?.[0]?.innerRhData,
      )
      .map((inspection) => {
        const lhData = inspection.shimThickness[0]?.innerLhData;
        const rhData = inspection.shimThickness[0]?.innerRhData;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          innerLhTop: lhData?.top !== null ? Number(convertValue(Number(lhData?.top))) || 0 : 0,
          innerLhBottom:
            lhData?.bottom !== null ? Number(convertValue(Number(lhData?.bottom))) || 0 : 0,
          innerLhLeft: lhData?.left !== null ? Number(convertValue(Number(lhData?.left))) || 0 : 0,
          innerLhRight:
            lhData?.right !== null ? Number(convertValue(Number(lhData?.right))) || 0 : 0,
          innerRhTop: rhData?.top !== null ? Number(convertValue(Number(rhData?.top))) || 0 : 0,
          innerRhBottom:
            rhData?.bottom !== null ? Number(convertValue(Number(rhData?.bottom))) || 0 : 0,
          innerRhLeft: rhData?.left !== null ? Number(convertValue(Number(rhData?.left))) || 0 : 0,
          innerRhRight:
            rhData?.right !== null ? Number(convertValue(Number(rhData?.right))) || 0 : 0,
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
            <CardTitle>{t('sectionTitles.shimThicknessMeasurements')}</CardTitle>
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
                sectionName="Shim Thickness"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inspectionsWithData.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="muted">{t('labels.noShimThicknessData')}</Typography>
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

              {/* Shim Thickness Tabs */}
              <Tabs defaultValue="outer" className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="outer">{t('labels.outer')}</TabsTrigger>
                  <TabsTrigger value="inner">{t('labels.inner')}</TabsTrigger>
                </TabsList>

                <TabsContent value="outer">
                  <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {renderShimDisplay(t('labels.outerLH'), latestData?.outerLhData)}
                      {renderShimDisplay(t('labels.outerRH'), latestData?.outerRhData)}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="inner">
                  <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {renderShimDisplay(t('labels.innerLH'), latestData?.innerLhData)}
                      {renderShimDisplay(t('labels.innerRH'), latestData?.innerRhData)}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Charts */}
              {(outerChartData.length > 0 || innerChartData.length > 0) && (
                <div className="space-y-6 mb-8">
                  <Typography variant="h4" className="mb-4">
                    {t('labels.measurementTrends')}
                  </Typography>

                  {/* Outer LH Chart */}
                  {outerChartData.length > 0 && (
                    <MultiLineThresholdChart
                      title={t('chartTitles.outerLHMeasurements')}
                      data={outerChartData}
                      lines={[
                        { dataKey: 'outerLhTop', label: t('labels.top'), color: '#8884d8' },
                        { dataKey: 'outerLhBottom', label: t('labels.bottom'), color: '#06b6d4' },
                        { dataKey: 'outerLhLeft', label: t('labels.left'), color: '#3b82f6' },
                        { dataKey: 'outerLhRight', label: t('labels.right'), color: '#ec4899' },
                      ]}
                      valueUnit={getLengthUnitLabel()}
                      allowToggle={true}
                      height={300}
                    />
                  )}

                  {/* Outer RH Chart */}
                  {outerChartData.length > 0 && (
                    <MultiLineThresholdChart
                      title={t('chartTitles.outerRHMeasurements')}
                      data={outerChartData}
                      lines={[
                        { dataKey: 'outerRhTop', label: t('labels.top'), color: '#10b981' },
                        { dataKey: 'outerRhBottom', label: t('labels.bottom'), color: '#f59e0b' },
                        { dataKey: 'outerRhLeft', label: t('labels.left'), color: '#ef4444' },
                        { dataKey: 'outerRhRight', label: t('labels.right'), color: '#8b5cf6' },
                      ]}
                      valueUnit={getLengthUnitLabel()}
                      allowToggle={true}
                      height={300}
                    />
                  )}

                  {/* Inner LH Chart */}
                  {innerChartData.length > 0 && (
                    <MultiLineThresholdChart
                      title={t('chartTitles.innerLHMeasurements')}
                      data={innerChartData}
                      lines={[
                        { dataKey: 'innerLhTop', label: t('labels.top'), color: '#8884d8' },
                        { dataKey: 'innerLhBottom', label: t('labels.bottom'), color: '#06b6d4' },
                        { dataKey: 'innerLhLeft', label: t('labels.left'), color: '#3b82f6' },
                        { dataKey: 'innerLhRight', label: t('labels.right'), color: '#ec4899' },
                      ]}
                      valueUnit={getLengthUnitLabel()}
                      allowToggle={true}
                      height={300}
                    />
                  )}

                  {/* Inner RH Chart */}
                  {innerChartData.length > 0 && (
                    <MultiLineThresholdChart
                      title={t('chartTitles.innerRHMeasurements')}
                      data={innerChartData}
                      lines={[
                        { dataKey: 'innerRhTop', label: t('labels.top'), color: '#10b981' },
                        { dataKey: 'innerRhBottom', label: t('labels.bottom'), color: '#f59e0b' },
                        { dataKey: 'innerRhLeft', label: t('labels.left'), color: '#ef4444' },
                        { dataKey: 'innerRhRight', label: t('labels.right'), color: '#8b5cf6' },
                      ]}
                      valueUnit={getLengthUnitLabel()}
                      allowToggle={true}
                      height={300}
                    />
                  )}
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
