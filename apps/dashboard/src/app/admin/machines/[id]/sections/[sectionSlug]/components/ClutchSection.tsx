'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { ClutchInspectionData } from './ClutchSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformClutchToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getClutchThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { type SectionStatus, calculateSectionStatus } from '@/components/shared/SectionStatusBadge';
import { SectionStatusCard } from '@/components/shared/SectionStatusCard';
import { CLUTCH_BRAKE_SUBSECTIONS } from '@/data/parts/section-subsections';

interface ClutchSectionProps {
  machineId: string;
  inspections: ClutchInspectionData[];
  machineName: string;
  machineSerial?: string;
  blueprintId: string;
  hideThresholdValues?: boolean;
}

export function ClutchSection({
  machineId,
  inspections,
  machineName,
  machineSerial,
  blueprintId,
  hideThresholdValues = false,
}: ClutchSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tParts = useTranslations('parts');
  const contentRef = useRef<HTMLDivElement>(null);
  // Thresholds for hydraulic clutch clearance
  const [hydTotalThreshold, setHydTotalThreshold] = useState<ThresholdConfig | null>(null);
  const [hydRearThreshold, setHydRearThreshold] = useState<ThresholdConfig | null>(null);
  // Thresholds for brake spring measurements
  const [fbThreshold, setFbThreshold] = useState<ThresholdConfig | null>(null);
  const [fTBThreshold, setFTBThreshold] = useState<ThresholdConfig | null>(null);
  const [rTBThreshold, setRTBThreshold] = useState<ThresholdConfig | null>(null);
  // Unit toggle state: 'mm' or 'in'
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

  // Fetch threshold data
  useEffect(() => {
    async function fetchThreshold() {
      console.log('📊 ClutchSection: Fetching threshold for blueprintId:', blueprintId);
      if (!blueprintId) {
        console.log('📊 ClutchSection: No blueprintId provided');
        return;
      }

      try {
        const response = await getClutchThresholdByBlueprint(blueprintId);
        console.log('📊 ClutchSection: API Response:', response);
        if (response.data) {
          // Extract all 5 thresholds
          setHydTotalThreshold(extractThresholdConfig(response.data, 'hydClutchClearanceTotal'));
          setHydRearThreshold(extractThresholdConfig(response.data, 'hydClutchClearanceRear'));
          setFbThreshold(extractThresholdConfig(response.data, 'fb'));
          setFTBThreshold(extractThresholdConfig(response.data, 'fTB'));
          setRTBThreshold(extractThresholdConfig(response.data, 'rTB'));
        } else {
          console.log('📊 ClutchSection: No data in response, error:', response.error);
        }
      } catch (error) {
        console.error('Failed to fetch clutch threshold:', error);
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

  // Filter to only inspections that have clutch data
  const inspectionsWithClutchData = useMemo(() => {
    return filteredInspections.filter((inspection) => inspection.clutch?.[0]?.data);
  }, [filteredInspections]);

  // Find the latest inspection that actually has clutch data (for date display)
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithClutchData[0]; // Already filtered and sorted, first one is latest
  }, [inspectionsWithClutchData]);

  // Find the most recent value for each clutch field across all inspections
  // This handles cases where different inspections have different fields filled
  const getLatestFieldValue = (fieldName: string): number | null => {
    for (const inspection of filteredInspections) {
      const clutchData = inspection?.clutch?.[0]?.data;
      if (clutchData) {
        const value = clutchData[fieldName as keyof typeof clutchData];
        if (value !== null && value !== undefined) {
          return typeof value === 'number' ? value : Number(value);
        }
      }
    }
    return null;
  };

  // Get latest values for each field
  const latestValues = {
    hydClutchClearanceTotal: getLatestFieldValue('hydClutchClearanceTotal'),
    hydClutchClearanceRear: getLatestFieldValue('hydClutchClearanceRear'),
    brakeSpringFB: getLatestFieldValue('brakeSpringFB'),
    brakeSpringFTB: getLatestFieldValue('brakeSpringFTB'),
    brakeSpringRTB: getLatestFieldValue('brakeSpringRTB'),
  };

  // Transform data for charts
  const hydClearanceChartData = useMemo(() => {
    return transformClutchToMultiLineData(filteredInspections, [
      'hydClutchClearanceTotal',
      'hydClutchClearanceRear',
    ]);
  }, [filteredInspections]);

  const brakeSpringChartData = useMemo(() => {
    return transformClutchToMultiLineData(filteredInspections, [
      'brakeSpringFB',
      'brakeSpringFTB',
      'brakeSpringRTB',
    ]);
  }, [filteredInspections]);

  // Prepare measurements for status badge
  const statusMeasurements = useMemo(
    () => [
      { value: latestValues.hydClutchClearanceTotal, threshold: hydTotalThreshold },
      { value: latestValues.hydClutchClearanceRear, threshold: hydRearThreshold },
      { value: latestValues.brakeSpringFB, threshold: fbThreshold },
      { value: latestValues.brakeSpringFTB, threshold: fTBThreshold },
      { value: latestValues.brakeSpringRTB, threshold: rTBThreshold },
    ],
    [latestValues, hydTotalThreshold, hydRearThreshold, fbThreshold, fTBThreshold, rTBThreshold],
  );

  // Calculate section status for the status card
  const sectionStatus: SectionStatus = useMemo(
    () => calculateSectionStatus(statusMeasurements),
    [statusMeasurements],
  );

  // Conversion constants (data is stored in inches)
  const MM_PER_INCH = 25.4;

  // Convert value based on display unit (data stored in inches)
  const convertValue = useCallback(
    (value: number | null): number | null => {
      if (value === null) return null;
      return displayUnit === 'mm' ? value * MM_PER_INCH : value;
    },
    [displayUnit],
  );

  // Convert threshold based on display unit
  const convertThreshold = useCallback(
    (threshold: ThresholdConfig | null): ThresholdConfig | null => {
      if (!threshold) return null;
      if (displayUnit === 'in') return threshold;
      return {
        greenMin: threshold.greenMin * MM_PER_INCH,
        yellowMin: threshold.yellowMin * MM_PER_INCH,
        redMin: threshold.redMin * MM_PER_INCH,
        label: threshold.label,
      };
    },
    [displayUnit],
  );

  // Convert chart data based on display unit
  const convertChartData = useCallback(
    (
      data: ReturnType<typeof transformClutchToMultiLineData>,
      keys: string[],
    ): ReturnType<typeof transformClutchToMultiLineData> => {
      if (displayUnit === 'in') return data;
      return data.map((point) => {
        const converted = { ...point };
        keys.forEach((key) => {
          const val = point[key];
          if (typeof val === 'number') {
            (converted as Record<string, unknown>)[key] = val * MM_PER_INCH;
          }
        });
        return converted;
      });
    },
    [displayUnit],
  );

  // Get converted thresholds
  const hydTotalThresholdConverted = useMemo(
    () => convertThreshold(hydTotalThreshold),
    [convertThreshold, hydTotalThreshold],
  );
  const hydRearThresholdConverted = useMemo(
    () => convertThreshold(hydRearThreshold),
    [convertThreshold, hydRearThreshold],
  );
  const fbThresholdConverted = useMemo(
    () => convertThreshold(fbThreshold),
    [convertThreshold, fbThreshold],
  );
  const fTBThresholdConverted = useMemo(
    () => convertThreshold(fTBThreshold),
    [convertThreshold, fTBThreshold],
  );
  const rTBThresholdConverted = useMemo(
    () => convertThreshold(rTBThreshold),
    [convertThreshold, rTBThreshold],
  );

  // Get converted chart data
  const hydClearanceChartDataConverted = useMemo(
    () =>
      convertChartData(hydClearanceChartData, [
        'hydClutchClearanceTotal',
        'hydClutchClearanceRear',
      ]),
    [convertChartData, hydClearanceChartData],
  );
  const brakeSpringChartDataConverted = useMemo(
    () =>
      convertChartData(brakeSpringChartData, ['brakeSpringFB', 'brakeSpringFTB', 'brakeSpringRTB']),
    [convertChartData, brakeSpringChartData],
  );

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    const converted = convertValue(value as number);
    if (converted === null) return '-';
    return converted.toFixed(decimals);
  };

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
            <Typography variant="large">{inspectionsWithClutchData.length}</Typography>
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

      {/* Section Status Card with Parts Modal */}
      <SectionStatusCard
        status={sectionStatus}
        partsConfig={{
          subsections: CLUTCH_BRAKE_SUBSECTIONS,
          title: tParts('clutchBrakeParts'),
          description: tParts('clutchBrakeDescription'),
          machineId,
          machineName,
          machineSerial,
          sectionName: 'Clutch & Brake',
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('sectionTitles.clutchMeasurements')}</CardTitle>
            <div className="flex items-center gap-3">
              {/* Unit Toggle */}
              <div className="flex items-center rounded-md border">
                <Button
                  variant={displayUnit === 'mm' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 rounded-r-none"
                  onClick={() => setDisplayUnit('mm')}
                >
                  mm
                </Button>
                <Button
                  variant={displayUnit === 'in' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 rounded-l-none"
                  onClick={() => setDisplayUnit('in')}
                >
                  in
                </Button>
              </div>
              <SectionExportButton
                contentRef={contentRef}
                sectionName="Clutch"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Typography variant="muted" className="mb-1">
                  {t('labels.hydClutchTotal')}
                </Typography>
                <Typography variant="large">
                  {formatValue(latestValues.hydClutchClearanceTotal)}
                </Typography>
              </div>
              <div>
                <Typography variant="muted" className="mb-1">
                  {t('labels.hydClutchRear')}
                </Typography>
                <Typography variant="large">
                  {formatValue(latestValues.hydClutchClearanceRear)}
                </Typography>
              </div>
              <div>
                <Typography variant="muted" className="mb-1">
                  F-B
                </Typography>
                <Typography variant="large">{formatValue(latestValues.brakeSpringFB)}</Typography>
              </div>
              <div>
                <Typography variant="muted" className="mb-1">
                  F-TB
                </Typography>
                <Typography variant="large">{formatValue(latestValues.brakeSpringFTB)}</Typography>
              </div>
              <div>
                <Typography variant="muted" className="mb-1">
                  R-TB
                </Typography>
                <Typography variant="large">{formatValue(latestValues.brakeSpringRTB)}</Typography>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <MultiLineThresholdChart
              title={t('chartTitles.hydraulicClutchClearance')}
              data={hydClearanceChartDataConverted}
              lines={[
                {
                  dataKey: 'hydClutchClearanceTotal',
                  label: 'Hyd Total',
                  color: '#8884d8',
                  threshold: hydTotalThresholdConverted ?? undefined,
                },
                {
                  dataKey: 'hydClutchClearanceRear',
                  label: 'Hyd Rear',
                  color: '#06b6d4',
                  threshold: hydRearThresholdConverted ?? undefined,
                },
              ]}
              sharedThreshold={hydTotalThresholdConverted}
              valueUnit={displayUnit}
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={300}
            />

            <MultiLineThresholdChart
              title="F-B (Front-Back)"
              data={brakeSpringChartDataConverted}
              lines={[
                {
                  dataKey: 'brakeSpringFB',
                  label: 'F-B',
                  color: '#3b82f6',
                  threshold: fbThresholdConverted ?? undefined,
                },
              ]}
              sharedThreshold={fbThresholdConverted}
              valueUnit={displayUnit}
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={250}
            />

            <MultiLineThresholdChart
              title="F-TB (Front Top-Bottom)"
              data={brakeSpringChartDataConverted}
              lines={[
                {
                  dataKey: 'brakeSpringFTB',
                  label: 'F-TB',
                  color: '#ec4899',
                  threshold: fTBThresholdConverted ?? undefined,
                },
              ]}
              sharedThreshold={fTBThresholdConverted}
              valueUnit={displayUnit}
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={250}
            />

            <MultiLineThresholdChart
              title="R-TB (Rear Top-Bottom)"
              data={brakeSpringChartDataConverted}
              lines={[
                {
                  dataKey: 'brakeSpringRTB',
                  label: 'R-TB',
                  color: '#6366f1',
                  threshold: rTBThresholdConverted ?? undefined,
                },
              ]}
              sharedThreshold={rTBThresholdConverted}
              valueUnit={displayUnit}
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={250}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
