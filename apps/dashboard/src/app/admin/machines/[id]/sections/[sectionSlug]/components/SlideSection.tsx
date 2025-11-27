'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { SlideInspectionData } from './SlideSectionWrapper';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformSlidePositionsToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getSlideThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';

interface SlideSectionProps {
  machineId: string;
  inspections: SlideInspectionData[];
  machineName: string;
  blueprintId: string;
}

export function SlideSection({ inspections, machineName, blueprintId }: SlideSectionProps) {
  const t = useTranslations('machines.sectionDetails');
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
        const response = await getSlideThresholdByBlueprint(blueprintId);
        console.log('📊 SlideSection: API Response:', response);
        if (response.data) {
          // Extract thresholds for position measurements
          const threshold = extractThresholdConfig(response.data, 'position');
          setPositionThreshold(threshold);
        } else {
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

  const latestInspection = filteredInspections[0];
  const latestOuterData = latestInspection?.slide?.[0]?.outerData;
  const latestInnerData = latestInspection?.slide?.[0]?.innerData;

  // Transform data for charts
  const outerPositionsChartData = useMemo(() => {
    return transformSlidePositionsToMultiLineData(filteredInspections, 'outer');
  }, [filteredInspections]);

  const innerPositionsChartData = useMemo(() => {
    return transformSlidePositionsToMultiLineData(filteredInspections, 'inner');
  }, [filteredInspections]);

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(decimals);
  };

  return (
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
              {latestInspection ? format(new Date(latestInspection.date), 'dd/MM/yyyy') : '-'}
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
          <CardTitle>Slide Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Outer Slide Values */}
          <div className="mb-8">
            <Typography variant="h4" className="mb-4">
              Outer Slide
            </Typography>
            <div className="text-center">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 1
                  </Typography>
                  <Typography variant="large">{formatValue(latestOuterData?.position1)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 2
                  </Typography>
                  <Typography variant="large">{formatValue(latestOuterData?.position2)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 3
                  </Typography>
                  <Typography variant="large">{formatValue(latestOuterData?.position3)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 4
                  </Typography>
                  <Typography variant="large">{formatValue(latestOuterData?.position4)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 5
                  </Typography>
                  <Typography variant="large">{formatValue(latestOuterData?.position5)}</Typography>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Typography variant="muted" className="mb-1">
                    Parallelism
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestOuterData?.parallelism)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Shutheight (Actual)
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestOuterData?.shutheightActualSh)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Inner Slide Values */}
          <div className="mb-6">
            <Typography variant="h4" className="mb-4">
              Inner Slide
            </Typography>
            <div className="text-center">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 1
                  </Typography>
                  <Typography variant="large">{formatValue(latestInnerData?.position1)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 2
                  </Typography>
                  <Typography variant="large">{formatValue(latestInnerData?.position2)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 3
                  </Typography>
                  <Typography variant="large">{formatValue(latestInnerData?.position3)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 4
                  </Typography>
                  <Typography variant="large">{formatValue(latestInnerData?.position4)}</Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Position 5
                  </Typography>
                  <Typography variant="large">{formatValue(latestInnerData?.position5)}</Typography>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Typography variant="muted" className="mb-1">
                    Parallelism
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestInnerData?.parallelism)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    Shutheight (Actual)
                  </Typography>
                  <Typography variant="large">
                    {formatValue(latestInnerData?.shutheightActualSh)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <MultiLineThresholdChart
              title="Outer Slide Positions (Position 1-5)"
              data={outerPositionsChartData}
              lines={[
                { dataKey: 'position1', label: 'Position 1', color: '#8884d8' },
                { dataKey: 'position2', label: 'Position 2', color: '#82ca9d' },
                { dataKey: 'position3', label: 'Position 3', color: '#ffc658' },
                { dataKey: 'position4', label: 'Position 4', color: '#ff7300' },
                { dataKey: 'position5', label: 'Position 5', color: '#00C49F' },
              ]}
              sharedThreshold={positionThreshold}
              valueUnit="mm"
              allowToggle={true}
              height={300}
            />

            <MultiLineThresholdChart
              title="Inner Slide Positions (Position 1-5)"
              data={innerPositionsChartData}
              lines={[
                { dataKey: 'position1', label: 'Position 1', color: '#8884d8' },
                { dataKey: 'position2', label: 'Position 2', color: '#82ca9d' },
                { dataKey: 'position3', label: 'Position 3', color: '#ffc658' },
                { dataKey: 'position4', label: 'Position 4', color: '#ff7300' },
                { dataKey: 'position5', label: 'Position 5', color: '#00C49F' },
              ]}
              sharedThreshold={positionThreshold}
              valueUnit="mm"
              allowToggle={true}
              height={300}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
