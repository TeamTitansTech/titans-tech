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
import { BearingClearanceSingleHammerInspectionData } from './BearingClearanceSingleHammerSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import { extractThresholdConfig } from '@/components/charts/dataTransformers';
import { getBearingClearanceSingleHammerThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { type SectionStatus, calculateSectionStatus } from '@/components/shared/SectionStatusBadge';
import { SectionStatusCard } from '@/components/shared/SectionStatusCard';
import { BEARING_CLEARANCE_SINGLE_HAMMER_SUBSECTIONS } from '@/data/parts/section-subsections';
import { useUnitManager } from '@/contexts/UnitManagerContext';

interface BearingClearanceSingleHammerSectionProps {
  machineId: string;
  inspections: BearingClearanceSingleHammerInspectionData[];
  machineName: string;
  blueprintId: string;
  hideThresholdValues?: boolean;
}

export function BearingClearanceSingleHammerSection({
  machineId,
  inspections,
  machineName,
  blueprintId,
  hideThresholdValues = false,
}: BearingClearanceSingleHammerSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tParts = useTranslations('parts');
  const contentRef = useRef<HTMLDivElement>(null);
  // Separate thresholds for each measurement type
  const [cbThreshold, setCbThreshold] = useState<ThresholdConfig | null>(null);
  const [totalClearanceThreshold, setTotalClearanceThreshold] = useState<ThresholdConfig | null>(
    null,
  );
  // Use global unit context
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
        const response = await getBearingClearanceSingleHammerThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract thresholds for each measurement type
          setCbThreshold(extractThresholdConfig(response.data, 'upperConnectionBearings'));
          setTotalClearanceThreshold(extractThresholdConfig(response.data, 'totalClearance'));
        } else {
          console.log('No threshold data in response for bearing clearance single hammer');
        }
      } catch (error) {
        console.error('Failed to fetch threshold:', error);
      }
    }
    fetchThreshold();
  }, [blueprintId]);

  const filteredInspections = useMemo(() => {
    return (
      inspections?.filter((inspection) => {
        const inspectionDate = new Date(inspection.date);
        if (date?.from && inspectionDate < date.from) return false;
        if (date?.to && inspectionDate > date.to) return false;
        return true;
      }) ?? []
    );
  }, [inspections, date]);

  const sortedInspections = useMemo(() => {
    return [...filteredInspections].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [filteredInspections]);

  // Filter to only inspections that have bearing clearance single hammer data
  const inspectionsWithBearingData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) => inspection.bearingClearanceSingleHammer?.[0]?.data,
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithBearingData[0];
  }, [inspectionsWithBearingData]);

  // Find the most recent value for each bearing field
  const getLatestFieldValue = (fieldName: string): number | null => {
    for (const inspection of sortedInspections) {
      const bearingData = inspection?.bearingClearanceSingleHammer?.[0]?.data;
      if (bearingData) {
        const value = bearingData[fieldName as keyof typeof bearingData];
        if (value !== null && value !== undefined) {
          return typeof value === 'number' ? value : Number(value);
        }
      }
    }
    return null;
  };

  // Get latest values for each field
  const latestValues = {
    mainBearings_LH: getLatestFieldValue('mainBearings_LH'),
    mainBearings_RH: getLatestFieldValue('mainBearings_RH'),
    upperConnectionBearings_LH: getLatestFieldValue('upperConnectionBearings_LH'),
    upperConnectionBearings_RH: getLatestFieldValue('upperConnectionBearings_RH'),
    totalClearance_LH: getLatestFieldValue('totalClearance_LH'),
    totalClearance_RH: getLatestFieldValue('totalClearance_RH'),
  };

  // Calculate differentials
  const calculateDifferential = (lh: number | null, rh: number | null): number | null => {
    if (lh === null || rh === null) return null;
    return Math.abs(rh - lh);
  };

  const differentials = {
    totalClearance: calculateDifferential(
      latestValues.totalClearance_LH,
      latestValues.totalClearance_RH,
    ),
    upperConnectionBearings: calculateDifferential(
      latestValues.upperConnectionBearings_LH,
      latestValues.upperConnectionBearings_RH,
    ),
    mainBearings: calculateDifferential(latestValues.mainBearings_LH, latestValues.mainBearings_RH),
  };

  // Prepare measurements for status badge (using differentials)
  const statusMeasurements = useMemo(
    () => [
      { value: differentials.totalClearance, threshold: totalClearanceThreshold },
      { value: differentials.upperConnectionBearings, threshold: cbThreshold },
    ],
    [
      differentials.totalClearance,
      differentials.upperConnectionBearings,
      totalClearanceThreshold,
      cbThreshold,
    ],
  );

  // Calculate section status for the status card
  const sectionStatus: SectionStatus = useMemo(
    () => calculateSectionStatus(statusMeasurements),
    [statusMeasurements],
  );

  // Convert value using global unit context
  const convertValue = useCallback(
    (value: number | null): number | null => {
      if (value === null) return null;
      return convertLengthFromDefault(value);
    },
    [convertLengthFromDefault],
  );

  // Convert threshold using global unit context
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

  // Get converted thresholds
  const cbThresholdConverted = useMemo(
    () => convertThreshold(cbThreshold),
    [convertThreshold, cbThreshold],
  );
  const totalClearanceThresholdConverted = useMemo(
    () => convertThreshold(totalClearanceThreshold),
    [convertThreshold, totalClearanceThreshold],
  );

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    const converted = convertValue(value as number);
    if (converted === null) return '-';
    return converted.toFixed(decimals);
  };

  // Transform data for differential chart
  const differentialChartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.bearingClearanceSingleHammer?.[0]?.data)
      .map((inspection) => {
        const data = inspection.bearingClearanceSingleHammer[0].data!;

        const tcLh = data.totalClearance_LH ?? 0;
        const tcRh = data.totalClearance_RH ?? 0;
        const ucbLh = data.upperConnectionBearings_LH ?? 0;
        const ucbRh = data.upperConnectionBearings_RH ?? 0;
        const mbLh = data.mainBearings_LH ?? 0;
        const mbRh = data.mainBearings_RH ?? 0;

        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          totalClearance_diff: convertLengthFromDefault(Math.abs(tcRh - tcLh)),
          upperConnectionBearings_diff: convertLengthFromDefault(Math.abs(ucbRh - ucbLh)),
          mainBearings_diff: convertLengthFromDefault(Math.abs(mbRh - mbLh)),
        };
      })
      .reverse();
  }, [filteredInspections, convertLengthFromDefault]);

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
            <Typography variant="large">{inspectionsWithBearingData.length}</Typography>
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
          subsections: BEARING_CLEARANCE_SINGLE_HAMMER_SUBSECTIONS,
          title: tParts('bearingClearanceSingleHammerParts'),
          description: tParts('bearingClearanceSingleHammerDescription'),
          machineId,
          machineName,
          sectionName: 'Bearing Clearance Single Hammer',
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('connectionBearingClearance')}</CardTitle>
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
                sectionName="BearingClearanceSingleHammer"
                machineName={machineName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div>
                <Typography variant="muted" className="mb-1">
                  TC Differential
                </Typography>
                <Typography variant="large">{formatValue(differentials.totalClearance)}</Typography>
              </div>
              <div>
                <Typography variant="muted" className="mb-1">
                  UCB Differential
                </Typography>
                <Typography variant="large">
                  {formatValue(differentials.upperConnectionBearings)}
                </Typography>
              </div>
              <div>
                <Typography variant="muted" className="mb-1">
                  MB Differential
                </Typography>
                <Typography variant="large">{formatValue(differentials.mainBearings)}</Typography>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <MultiLineThresholdChart
              title="Bearing Clearance Differentials"
              data={differentialChartData}
              lines={[
                {
                  dataKey: 'totalClearance_diff',
                  label: 'TC Diff',
                  color: '#3b82f6',
                  threshold: totalClearanceThresholdConverted ?? undefined,
                },
                {
                  dataKey: 'upperConnectionBearings_diff',
                  label: 'UCB Diff',
                  color: '#8884d8',
                  threshold: cbThresholdConverted ?? undefined,
                },
                {
                  dataKey: 'mainBearings_diff',
                  label: 'MB Diff',
                  color: '#06b6d4',
                },
              ]}
              sharedThreshold={totalClearanceThresholdConverted}
              valueUnit={getLengthUnitLabel()}
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={350}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
