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
import { InspectionData } from './BearingClearanceSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformBearingClearanceToDifferentialData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getBearingClearanceThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SectionExportButton } from '@/components/shared/SectionExportButton';

interface BearingClearanceSectionProps {
  machineId: string;
  inspections: InspectionData[];
  machineName: string;
  blueprintId: string;
  hideThresholdValues?: boolean;
}

export function BearingClearanceSection({
  inspections,
  machineName,
  blueprintId,
  hideThresholdValues = false,
}: BearingClearanceSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const contentRef = useRef<HTMLDivElement>(null);
  // Separate thresholds for each measurement type
  const [cbThreshold, setCbThreshold] = useState<ThresholdConfig | null>(null);
  const [totalClearanceThreshold, setTotalClearanceThreshold] = useState<ThresholdConfig | null>(
    null,
  );
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
        const response = await getBearingClearanceThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract thresholds for each measurement type
          setCbThreshold(extractThresholdConfig(response.data, 'upperConnectionBearings'));
          setTotalClearanceThreshold(extractThresholdConfig(response.data, 'totalClearance'));
        } else {
          console.log('⚠️  No threshold data in response');
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

  // Find the latest inspection that actually has bearing clearance data (for date display)
  const latestInspectionWithData = useMemo(() => {
    return sortedInspections.find((inspection) => inspection.bearingClearance?.[0]?.outerData);
  }, [sortedInspections]);

  // Find the most recent value for each bearing field across all inspections
  const getLatestFieldValue = (fieldName: string): number | null => {
    for (const inspection of sortedInspections) {
      const bearingData = inspection?.bearingClearance?.[0]?.outerData;
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

  // Calculate differentials (what matters for alerts)
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

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(decimals);
  };

  // Transform data for differential chart (shows all differentials over time)
  const differentialChartData = useMemo(() => {
    return transformBearingClearanceToDifferentialData(filteredInspections);
  }, [filteredInspections]);

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
            <CardTitle>{t('connectionBearingClearance')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="BearingClearance"
              machineName={machineName}
            />
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
                  threshold: totalClearanceThreshold ?? undefined,
                },
                {
                  dataKey: 'upperConnectionBearings_diff',
                  label: 'UCB Diff',
                  color: '#8884d8',
                  threshold: cbThreshold ?? undefined,
                },
                {
                  dataKey: 'mainBearings_diff',
                  label: 'MB Diff',
                  color: '#06b6d4',
                },
              ]}
              sharedThreshold={totalClearanceThreshold}
              valueUnit="mm"
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
