'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { SlideInspectionData } from './SlideDoubleHammerSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformSlidePositionsToMultiLineData,
  transformSlideMaxDeviationToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getSlideDoubleHammerThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { type SectionStatus, calculateSectionStatus } from '@/components/shared/SectionStatusBadge';
import { SectionStatusCard } from '@/components/shared/SectionStatusCard';
import { SLIDE_SUBSECTIONS } from '@/data/parts/section-subsections';

interface SlideSectionProps {
  machineId: string;
  inspections: SlideInspectionData[];
  machineName: string;
  blueprintId: string;
  hideThresholdValues?: boolean;
}

export function SlideDoubleHammerSection({
  machineId,
  inspections,
  machineName,
  blueprintId,
  hideThresholdValues = false,
}: SlideSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tParts = useTranslations('parts');
  const contentRef = useRef<HTMLDivElement>(null);
  const [positionThreshold, setPositionThreshold] = useState<ThresholdConfig | null>(null);
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
        const response = await getSlideDoubleHammerThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract threshold for max deviation (single threshold for all positions)
          const threshold = extractThresholdConfig(response.data, 'maxDeviation');
          setPositionThreshold(threshold);
        } else {
          console.log('📊 SlideSection: No data in response');
        }
      } catch (error) {
        console.error('Failed to fetch slide threshold:', error);
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

  // Find the latest inspection that actually has slide data (not just any inspection)
  const latestInspectionWithData = useMemo(() => {
    return filteredInspections.find(
      (inspection) => inspection.slide?.[0]?.outerData || inspection.slide?.[0]?.innerData,
    );
  }, [filteredInspections]);

  const latestOuterData = latestInspectionWithData?.slide?.[0]?.outerData;
  const latestInnerData = latestInspectionWithData?.slide?.[0]?.innerData;

  // Transform data for charts
  const outerPositionsChartData = useMemo(() => {
    return transformSlidePositionsToMultiLineData(filteredInspections, 'outer');
  }, [filteredInspections]);

  const innerPositionsChartData = useMemo(() => {
    return transformSlidePositionsToMultiLineData(filteredInspections, 'inner');
  }, [filteredInspections]);

  // Transform data for max deviation chart
  const maxDeviationChartData = useMemo(() => {
    return transformSlideMaxDeviationToMultiLineData(filteredInspections);
  }, [filteredInspections]);

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    const numValue = Number(value);
    if (isNaN(numValue)) return '-';
    return numValue.toFixed(decimals);
  };

  // Calculate max deviation from positions (max - min)
  const calculateMaxDeviation = (data: typeof latestOuterData): number | null => {
    if (!data) return null;

    const rawPositions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
    ];

    // Filter out null/undefined values first, then convert to numbers
    const positions = rawPositions
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map((p) => Number(p))
      .filter((p) => !isNaN(p));

    if (positions.length === 0) return null;
    return Math.max(...positions) - Math.min(...positions);
  };

  const outerMaxDeviation = calculateMaxDeviation(latestOuterData);
  const innerMaxDeviation = calculateMaxDeviation(latestInnerData);

  // Prepare measurements for status badge
  const statusMeasurements = useMemo(
    () => [
      { value: outerMaxDeviation, threshold: positionThreshold },
      { value: innerMaxDeviation, threshold: positionThreshold },
    ],
    [outerMaxDeviation, innerMaxDeviation, positionThreshold],
  );

  // Calculate section status for the status card
  const sectionStatus: SectionStatus = useMemo(
    () => calculateSectionStatus(statusMeasurements),
    [statusMeasurements],
  );

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

      {/* Section Status Card with Parts Modal */}
      <SectionStatusCard
        status={sectionStatus}
        partsConfig={{
          subsections: SLIDE_SUBSECTIONS,
          title: tParts('slideParts'),
          description: tParts('slideDescription'),
          machineId,
          machineName,
          sectionName: 'Slide',
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('sectionTitles.slideMeasurements')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="Slide"
              machineName={machineName}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Outer Slide Values */}
          <div className="mb-8">
            <Typography variant="h4" className="mb-4">
              {t('labels.outer')} Slide
            </Typography>
            <div className="border rounded-md overflow-hidden mb-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 1</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 2</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 3</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 4</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 5</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center bg-blue-50 dark:bg-blue-950">
                      Max Deviation
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestOuterData?.position1)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestOuterData?.position2)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestOuterData?.position3)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestOuterData?.position4)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestOuterData?.position5)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                      {formatValue(outerMaxDeviation)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-10 text-xs font-semibold">Field</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-2 font-medium bg-muted/20">Parallelism</TableCell>
                    <TableCell className="py-2 text-center">
                      {formatValue(latestOuterData?.parallelism)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-2 font-medium bg-muted/20">
                      Shutheight (Actual)
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {formatValue(latestOuterData?.shutheightActualSh)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Inner Slide Values */}
          <div className="mb-6">
            <Typography variant="h4" className="mb-4">
              {t('labels.inner')} Slide
            </Typography>
            <div className="border rounded-md overflow-hidden mb-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 1</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 2</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 3</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 4</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Pos 5</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center bg-blue-50 dark:bg-blue-950">
                      Max Deviation
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestInnerData?.position1)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestInnerData?.position2)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestInnerData?.position3)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestInnerData?.position4)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium">
                      {formatValue(latestInnerData?.position5)}
                    </TableCell>
                    <TableCell className="py-3 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                      {formatValue(innerMaxDeviation)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-10 text-xs font-semibold">Field</TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-center">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-2 font-medium bg-muted/20">Parallelism</TableCell>
                    <TableCell className="py-2 text-center">
                      {formatValue(latestInnerData?.parallelism)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-2 font-medium bg-muted/20">
                      Shutheight (Actual)
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {formatValue(latestInnerData?.shutheightActualSh)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            {/* Max Deviation Chart - Main threshold chart */}
            <MultiLineThresholdChart
              title={t('chartTitles.slideMaxDeviation')}
              data={maxDeviationChartData}
              lines={[
                { dataKey: 'outerMaxDeviation', label: 'Outer Max Deviation', color: '#8884d8' },
                { dataKey: 'innerMaxDeviation', label: 'Inner Max Deviation', color: '#06b6d4' },
              ]}
              sharedThreshold={positionThreshold}
              valueUnit="mm"
              allowToggle={true}
              hideThresholdValues={hideThresholdValues}
              height={300}
            />

            <MultiLineThresholdChart
              title={t('chartTitles.outerSlidePositions')}
              data={outerPositionsChartData}
              lines={[
                { dataKey: 'position1', label: 'Position 1', color: '#8884d8' },
                { dataKey: 'position2', label: 'Position 2', color: '#06b6d4' },
                { dataKey: 'position3', label: 'Position 3', color: '#3b82f6' },
                { dataKey: 'position4', label: 'Position 4', color: '#ec4899' },
                { dataKey: 'position5', label: 'Position 5', color: '#6366f1' },
              ]}
              valueUnit="mm"
              allowToggle={false}
              height={300}
            />

            <MultiLineThresholdChart
              title={t('chartTitles.innerSlidePositions')}
              data={innerPositionsChartData}
              lines={[
                { dataKey: 'position1', label: 'Position 1', color: '#8884d8' },
                { dataKey: 'position2', label: 'Position 2', color: '#06b6d4' },
                { dataKey: 'position3', label: 'Position 3', color: '#3b82f6' },
                { dataKey: 'position4', label: 'Position 4', color: '#ec4899' },
                { dataKey: 'position5', label: 'Position 5', color: '#6366f1' },
              ]}
              valueUnit="mm"
              allowToggle={false}
              height={300}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
