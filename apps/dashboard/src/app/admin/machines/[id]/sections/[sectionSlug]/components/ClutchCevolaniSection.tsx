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
import type { ClutchCevolaniInspectionData } from './ClutchCevolaniSectionWrapper';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformClutchToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getClutchCevolaniThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { type SectionStatus, calculateSectionStatus } from '@/components/shared/SectionStatusBadge';
import { SectionStatusCard } from '@/components/shared/SectionStatusCard';
import { CLUTCH_CEVOLANI_SUBSECTIONS } from '@/data/parts/section-subsections';

interface ClutchCevolaniSectionProps {
  machineId: string;
  inspections: ClutchCevolaniInspectionData[];
  machineName: string;
  machineSerial?: string;
  blueprintId: string;
  hideThresholdValues?: boolean;
}

export function ClutchCevolaniSection({
  machineId,
  inspections,
  machineName,
  machineSerial,
  blueprintId,
  hideThresholdValues = false,
}: ClutchCevolaniSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tParts = useTranslations('parts');
  const contentRef = useRef<HTMLDivElement>(null);
  // Threshold for pneumatic clutch clearance
  const [pneumaticTotalThreshold, setPneumaticTotalThreshold] = useState<ThresholdConfig | null>(
    null,
  );
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
    async function fetchThreshold() {
      if (!blueprintId) {
        return;
      }

      try {
        const response = await getClutchCevolaniThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract pneumatic threshold
          setPneumaticTotalThreshold(
            extractThresholdConfig(response.data, 'pneumaticClutchClearanceTotal'),
          );
        }
      } catch (error) {
        console.error('Failed to fetch clutch cevolani threshold:', error);
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

  // Filter to only inspections that have clutch cevolani data
  const inspectionsWithClutchData = useMemo(() => {
    return filteredInspections.filter((inspection) => inspection.clutchCevolani?.[0]?.data);
  }, [filteredInspections]);

  // Find the latest inspection that actually has clutch cevolani data (for date display)
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithClutchData[0]; // Already filtered and sorted, first one is latest
  }, [inspectionsWithClutchData]);

  // Find the most recent value for each clutch field across all inspections
  // This handles cases where different inspections have different fields filled
  const getLatestFieldValue = (fieldName: string): number | null => {
    for (const inspection of filteredInspections) {
      const clutchData = inspection?.clutchCevolani?.[0]?.data;
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
    pneumaticClutchClearanceTotal: getLatestFieldValue('pneumaticClutchClearanceTotal'),
  };

  // Transform data for charts - map clutchCevolani to clutch for the transformer
  const transformedInspections = useMemo(() => {
    return filteredInspections.map((inspection) => ({
      ...inspection,
      clutch: inspection.clutchCevolani,
    }));
  }, [filteredInspections]);

  const pneumaticChartData = useMemo(() => {
    return transformClutchToMultiLineData(transformedInspections, [
      'pneumaticClutchClearanceTotal',
    ]);
  }, [transformedInspections]);

  // Prepare measurements for status badge
  const statusMeasurements = useMemo(
    () => [
      { value: latestValues.pneumaticClutchClearanceTotal, threshold: pneumaticTotalThreshold },
    ],
    [latestValues, pneumaticTotalThreshold],
  );

  // Calculate section status for the status card
  const sectionStatus: SectionStatus = useMemo(
    () => calculateSectionStatus(statusMeasurements),
    [statusMeasurements],
  );

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
    (
      data: ReturnType<typeof transformClutchToMultiLineData>,
      keys: string[],
    ): ReturnType<typeof transformClutchToMultiLineData> => {
      return data.map((point) => {
        const converted = { ...point };
        keys.forEach((key) => {
          const val = point[key];
          if (typeof val === 'number') {
            (converted as Record<string, unknown>)[key] = convertLengthFromDefault(val);
          }
        });
        return converted;
      });
    },
    [convertLengthFromDefault],
  );

  // Get converted thresholds
  const pneumaticTotalThresholdConverted = useMemo(
    () => convertThreshold(pneumaticTotalThreshold),
    [convertThreshold, pneumaticTotalThreshold],
  );

  // Get converted chart data
  const pneumaticChartDataConverted = useMemo(
    () => convertChartData(pneumaticChartData, ['pneumaticClutchClearanceTotal']),
    [convertChartData, pneumaticChartData],
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
          subsections: CLUTCH_CEVOLANI_SUBSECTIONS,
          title: tParts('clutchCevolaniParts'),
          description: tParts('clutchCevolaniDescription'),
          machineId,
          machineName,
          machineSerial,
          sectionName: 'Clutch - Cevolani',
          sectionKey: 'CLUTCH_CEVOLANI',
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('sectionTitles.clutchCevolaniMeasurements')}</CardTitle>
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
                sectionName="Clutch Cevolani"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="flex justify-center">
              <div>
                <Typography variant="muted" className="mb-1">
                  {t('labels.pneumaticClutchTotal')}
                </Typography>
                <Typography variant="large">
                  {formatValue(latestValues.pneumaticClutchClearanceTotal)}
                </Typography>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <MultiLineThresholdChart
              title={t('chartTitles.pneumaticClutchClearance')}
              data={pneumaticChartDataConverted}
              lines={[
                {
                  dataKey: 'pneumaticClutchClearanceTotal',
                  label: t('labels.pneumaticClutchTotal'),
                  color: '#8884d8',
                  threshold: pneumaticTotalThresholdConverted ?? undefined,
                },
              ]}
              sharedThreshold={pneumaticTotalThresholdConverted}
              valueUnit={getLengthUnitLabel()}
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={300}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
