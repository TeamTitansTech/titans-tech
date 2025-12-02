'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import { ClipboardCheck, Calendar as CalendarIcon, Package } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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
import { SectionStatusBadge } from '@/components/shared/SectionStatusBadge';
import { CLUTCH_BRAKE_SUBSECTIONS } from '@/data/parts/section-subsections';

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

  // Find the latest inspection that actually has clutch data (not just any inspection)
  const latestInspectionWithData = useMemo(() => {
    return filteredInspections.find((inspection) => inspection.clutch?.[0]?.data);
  }, [filteredInspections]);

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

  // Prepare measurements for status badge
  const statusMeasurements = useMemo(
    () => [
      { value: latestClutchData?.hydClutchClearanceTotal ?? null, threshold: hydTotalThreshold },
      { value: latestClutchData?.hydClutchClearanceRear ?? null, threshold: hydRearThreshold },
      { value: latestClutchData?.brakeSpringFB ?? null, threshold: fbThreshold },
      { value: latestClutchData?.brakeSpringFTB ?? null, threshold: fTBThreshold },
      { value: latestClutchData?.brakeSpringRTB ?? null, threshold: rTBThreshold },
    ],
    [
      latestClutchData,
      hydTotalThreshold,
      hydRearThreshold,
      fbThreshold,
      fTBThreshold,
      rTBThreshold,
    ],
  );

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(decimals);
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
            <div className="flex items-center gap-3">
              <CardTitle>Clutch Measurements</CardTitle>
              <SectionStatusBadge measurements={statusMeasurements} size="sm" />
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
                data={hydClearanceChartData}
                lines={[
                  {
                    dataKey: 'hydClutchClearanceTotal',
                    label: 'Hyd Total',
                    color: '#8884d8',
                    threshold: hydTotalThreshold ?? undefined,
                  },
                  {
                    dataKey: 'hydClutchClearanceRear',
                    label: 'Hyd Rear',
                    color: '#06b6d4',
                    threshold: hydRearThreshold ?? undefined,
                  },
                ]}
                sharedThreshold={hydTotalThreshold}
                valueUnit="mm"
                allowToggle={true}
                height={300}
              />

              <MultiLineThresholdChart
                title="Brake Spring Measurements (F-B, F-TB, R-TB)"
                data={brakeSpringChartData}
                lines={[
                  {
                    dataKey: 'brakeSpringFB',
                    label: 'F-B',
                    color: '#3b82f6',
                    threshold: fbThreshold ?? undefined,
                  },
                  {
                    dataKey: 'brakeSpringFTB',
                    label: 'F-TB',
                    color: '#ec4899',
                    threshold: fTBThreshold ?? undefined,
                  },
                  {
                    dataKey: 'brakeSpringRTB',
                    label: 'R-TB',
                    color: '#6366f1',
                    threshold: rTBThreshold ?? undefined,
                  },
                ]}
                sharedThreshold={fbThreshold}
                valueUnit="in"
                allowToggle={true}
                height={300}
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
          machineName={machineName}
          machineSerial={machineSerial}
          sectionName="Clutch & Brake"
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
