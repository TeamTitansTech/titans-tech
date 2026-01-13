'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import { ClipboardCheck, Calendar as CalendarIcon, Package } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { InspectionCreationModal } from '@/app/s/[subdomain]/machines/[id]/components/InspectionCreationModal';
import type { ClutchInspectionData } from './ClutchSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformClutchToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getClutchThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SubsectionPartsModal } from '@/components/parts/SubsectionPartsModal';
import { CLUTCH_BRAKE_SUBSECTIONS } from '@/data/parts/section-subsections';
import { useUnitManager } from '@/contexts/UnitManagerContext';

interface ClutchSectionProps {
  machineId: string;
  inspections: ClutchInspectionData[];
  machineName: string;
  machineSerial?: string;
  blueprintId: string;
}

export function ClutchSection({
  machineId,
  inspections,
  machineName,
  machineSerial,
  blueprintId,
}: ClutchSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tParts = useTranslations('parts');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  // Thresholds for hydraulic clutch clearance
  const [hydTotalThreshold, setHydTotalThreshold] = useState<ThresholdConfig | null>(null);
  const [hydRearThreshold, setHydRearThreshold] = useState<ThresholdConfig | null>(null);
  // Thresholds for brake spring measurements
  const [fbThreshold, setFbThreshold] = useState<ThresholdConfig | null>(null);
  const [fTBThreshold, setFTBThreshold] = useState<ThresholdConfig | null>(null);
  const [rTBThreshold, setRTBThreshold] = useState<ThresholdConfig | null>(null);
  // Use global unit context
  const { lengthUnit, setLengthUnit, convertLengthFromDefault } = useUnitManager();
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
        const response = await getClutchThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract all 5 thresholds
          setHydTotalThreshold(extractThresholdConfig(response.data, 'hydClutchClearanceTotal'));
          setHydRearThreshold(extractThresholdConfig(response.data, 'hydClutchClearanceRear'));
          setFbThreshold(extractThresholdConfig(response.data, 'fb'));
          setFTBThreshold(extractThresholdConfig(response.data, 'fTB'));
          setRTBThreshold(extractThresholdConfig(response.data, 'rTB'));
        }
      } catch (error) {
        console.error('Failed to fetch clutch threshold:', error);
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

  // Filter to only inspections that have clutch data
  const inspectionsWithClutchData = useMemo(() => {
    return filteredInspections.filter((inspection) => inspection.clutch?.[0]?.data);
  }, [filteredInspections]);

  // Find the latest inspection that actually has clutch data (not just any inspection)
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithClutchData[0];
  }, [inspectionsWithClutchData]);

  const latestClutchData = latestInspectionWithData?.clutch?.[0]?.data;

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

  // Convert value using global unit context (data stored in inches)
  const convertValue = useCallback(
    (value: number | null): number | null => {
      if (value === null) return null;
      return convertLengthFromDefault(value);
    },
    [convertLengthFromDefault],
  );

  // Convert threshold using global unit context (thresholds stored in inches)
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

  // Convert chart data using global unit context (data stored in inches)
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
    <>
      <div className="space-y-6">
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
                      'w-full justify-start text-left font-normal h-8',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {date?.from ? (
                      date.to ? (
                        <span className="text-xs">
                          {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                        </span>
                      ) : (
                        <span className="text-xs">{format(date.from, 'dd/MM/yyyy')}</span>
                      )
                    ) : (
                      <span className="text-xs">{t('pickDate')}</span>
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
              <CardTitle>Clutch Measurements</CardTitle>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Typography variant="muted" className="mb-1">
                    Hyd Clutch Total
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestClutchData?.hydClutchClearanceTotal)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Hyd Clutch Rear
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestClutchData?.hydClutchClearanceRear)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    F-B
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestClutchData?.brakeSpringFB)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    F-TB
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestClutchData?.brakeSpringFTB)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    R-TB
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestClutchData?.brakeSpringRTB)}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <MultiLineThresholdChart
                title="Hydraulic Clutch Clearance"
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
                valueUnit={lengthUnit === 'mm' ? 'mm' : 'in'}
                allowToggle={true}
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
                valueUnit={lengthUnit === 'mm' ? 'mm' : 'in'}
                allowToggle={true}
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
                valueUnit={lengthUnit === 'mm' ? 'mm' : 'in'}
                allowToggle={true}
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
                valueUnit={lengthUnit === 'mm' ? 'mm' : 'in'}
                allowToggle={true}
                height={250}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parts Replacement List */}
        <Button
          variant="outline"
          className="w-full justify-start border-primary/20 hover:bg-primary/5 dark:border-primary/30 dark:hover:bg-primary/10"
          onClick={() => setIsPartsModalOpen(true)}
        >
          <Package className="h-4 w-4 text-primary mr-2" />
          <span>{tParts('clutchBrakeParts')}</span>
        </Button>

        <SubsectionPartsModal
          isOpen={isPartsModalOpen}
          onClose={() => setIsPartsModalOpen(false)}
          title={tParts('clutchBrakeParts')}
          subsections={CLUTCH_BRAKE_SUBSECTIONS}
          machineId={machineId}
          machineName={machineName}
          machineSerial={machineSerial}
          sectionName="Clutch & Brake"
          sectionKey="CLUTCH"
        />

        <div className="flex justify-end">
          <Button onClick={() => setIsInspectionModalOpen(true)}>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            {t('createInspection')}
          </Button>
        </div>
      </div>

      <InspectionCreationModal
        machineId={machineId}
        open={isInspectionModalOpen}
        onOpenChange={setIsInspectionModalOpen}
      />
    </>
  );
}
