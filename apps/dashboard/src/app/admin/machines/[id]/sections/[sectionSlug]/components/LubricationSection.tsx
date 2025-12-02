'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  Calendar as CalendarIcon,
  Thermometer,
  Droplet,
  Filter,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { LubricationInspectionData } from './LubricationSectionWrapper';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SectionExportButton } from '@/components/shared/SectionExportButton';
import { type SectionStatus } from '@/components/shared/SectionStatusBadge';
import { SectionStatusCard } from '@/components/shared/SectionStatusCard';
import { LUBRICATION_SUBSECTIONS } from '@/data/parts/section-subsections';

interface LubricationSectionProps {
  machineId: string;
  inspections: LubricationInspectionData[];
  machineName: string;
  machineSerial?: string;
}

export function LubricationSection({
  inspections,
  machineName,
  machineSerial,
}: LubricationSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tCommon = useTranslations('common.status');
  const tParts = useTranslations('parts');
  const contentRef = useRef<HTMLDivElement>(null);
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

  // Find the most recent value for each field across all inspections
  const getLatestFieldValue = <T,>(fieldName: string): T | null => {
    for (const inspection of filteredInspections) {
      const lubData = inspection?.lubricationHydraulics?.[0]?.data;
      if (lubData) {
        const value = lubData[fieldName as keyof typeof lubData];
        if (value !== null && value !== undefined) {
          return value as T;
        }
      }
    }
    return null;
  };

  // Get latest values
  const latestValues = {
    changedOil: getLatestFieldValue<string>('changedOil'),
    oilTemperature: getLatestFieldValue<number>('oilTemperature'),
    oilTemperatureUnit: getLatestFieldValue<string>('oilTemperatureUnit') || 'FAHRENHEIT',
    oilMfgType: getLatestFieldValue<string>('oilMfgType'),
    changedFilter: getLatestFieldValue<string>('changedFilter'),
  };

  // Oil change alert logic - 333 days cycle
  const OIL_CHANGE_INTERVAL_DAYS = 333;
  const WARNING_THRESHOLD_DAYS = 30; // Warn 30 days before due

  // Find last oil change date (searching ALL inspections, not just filtered)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const lastOilChangeInfo = useMemo(() => {
    // Sort all inspections by date descending
    const sortedAll = [...inspections].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    for (const inspection of sortedAll) {
      const lubData = inspection?.lubricationHydraulics?.[0]?.data;
      if (lubData?.changedOil === 'YES') {
        const changeDate = new Date(inspection.date);
        const today = new Date();
        const daysSinceChange = differenceInDays(today, changeDate);
        const daysUntilDue = OIL_CHANGE_INTERVAL_DAYS - daysSinceChange;

        return {
          date: changeDate,
          daysSinceChange,
          daysUntilDue,
          isOverdue: daysUntilDue < 0,
          isWarning: daysUntilDue >= 0 && daysUntilDue <= WARNING_THRESHOLD_DAYS,
          isOk: daysUntilDue > WARNING_THRESHOLD_DAYS,
        };
      }
    }
    return null;
  }, [inspections]);

  // Calculate section status based on oil change info
  const sectionStatus: SectionStatus = useMemo(() => {
    if (!lastOilChangeInfo) return 'unknown';
    if (lastOilChangeInfo.isOverdue) return 'alert';
    if (lastOilChangeInfo.isWarning) return 'warning';
    return 'ok';
  }, [lastOilChangeInfo]);

  // Transform data for temperature chart
  const temperatureChartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.lubricationHydraulics?.[0]?.data?.oilTemperature != null)
      .map((inspection) => {
        const data = inspection.lubricationHydraulics[0].data!;
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          temperature: Number(data.oilTemperature),
          unit: data.oilTemperatureUnit || 'FAHRENHEIT',
        };
      })
      .reverse(); // Oldest to newest
  }, [filteredInspections]);

  // Get gauge summary from latest inspection
  const latestGauges = latestInspection?.lubricationHydraulics?.[0]?.data?.gauges || [];

  const formatYesNo = (value: string | null): { text: string; className: string } => {
    if (value === 'YES')
      return { text: tCommon('yes'), className: 'bg-green-100 text-green-800 border-green-200' };
    if (value === 'NO')
      return { text: tCommon('no'), className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: tCommon('dnc'), className: '' };
  };

  const formatSystemLabel = (system: string): string => {
    const labels: Record<string, string> = {
      LUBE: 'Lube',
      HYD: 'Hydraulic',
      MONITORFLOW: 'Monitor Flow',
      PRESS_SW: 'Press Switch',
      GIB: 'Gib',
    };
    return labels[system] || system;
  };

  const formatPsiStatus = (psi: string | null): { text: string; className: string } => {
    if (psi === 'OK')
      return { text: 'OK', className: 'bg-green-100 text-green-800 border-green-200' };
    if (psi === 'DAMAGED')
      return { text: 'Damaged', className: 'bg-red-100 text-red-800 border-red-200' };
    if (psi === 'NA') return { text: 'N/A', className: '' };
    return { text: 'DNC', className: '' };
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

      {/* Oil Change Alert */}
      {lastOilChangeInfo && (lastOilChangeInfo.isOverdue || lastOilChangeInfo.isWarning) && (
        <Card
          className={cn(
            'border-2',
            lastOilChangeInfo.isOverdue
              ? 'border-red-500 bg-red-50'
              : 'border-yellow-500 bg-yellow-50',
          )}
        >
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'p-3 rounded-full',
                  lastOilChangeInfo.isOverdue ? 'bg-red-100' : 'bg-yellow-100',
                )}
              >
                <AlertTriangle
                  className={cn(
                    'h-6 w-6',
                    lastOilChangeInfo.isOverdue ? 'text-red-600' : 'text-yellow-600',
                  )}
                />
              </div>
              <div className="flex-1">
                <Typography
                  variant="large"
                  className={lastOilChangeInfo.isOverdue ? 'text-red-800' : 'text-yellow-800'}
                >
                  {lastOilChangeInfo.isOverdue ? 'Oil Change Overdue!' : 'Oil Change Due Soon'}
                </Typography>
                <Typography
                  variant="muted"
                  className={lastOilChangeInfo.isOverdue ? 'text-red-600' : 'text-yellow-600'}
                >
                  Last changed: {format(lastOilChangeInfo.date, 'dd/MM/yyyy')} (
                  {lastOilChangeInfo.daysSinceChange} days ago)
                  {lastOilChangeInfo.isOverdue
                    ? ` - ${Math.abs(lastOilChangeInfo.daysUntilDue)} days overdue`
                    : ` - ${lastOilChangeInfo.daysUntilDue} days remaining`}
                </Typography>
              </div>
              <div className="text-right">
                <Typography
                  variant="h3"
                  className={lastOilChangeInfo.isOverdue ? 'text-red-700' : 'text-yellow-700'}
                >
                  {lastOilChangeInfo.isOverdue
                    ? `+${Math.abs(lastOilChangeInfo.daysUntilDue)}`
                    : lastOilChangeInfo.daysUntilDue}
                </Typography>
                <Typography
                  variant="muted"
                  className={lastOilChangeInfo.isOverdue ? 'text-red-600' : 'text-yellow-600'}
                >
                  {lastOilChangeInfo.isOverdue ? 'days overdue' : 'days left'}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Oil Change Status Card (when OK) */}
      {lastOilChangeInfo && lastOilChangeInfo.isOk && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <Typography variant="large" className="text-green-800">
                  Oil Change Status: OK
                </Typography>
                <Typography variant="muted" className="text-green-600">
                  Last changed: {format(lastOilChangeInfo.date, 'dd/MM/yyyy')} (
                  {lastOilChangeInfo.daysSinceChange} days ago) - Next change in{' '}
                  {lastOilChangeInfo.daysUntilDue} days
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="h3" className="text-green-700">
                  {lastOilChangeInfo.daysUntilDue}
                </Typography>
                <Typography variant="muted" className="text-green-600">
                  days left
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Status Card with Parts Modal */}
      <SectionStatusCard
        status={sectionStatus}
        partsConfig={{
          subsections: LUBRICATION_SUBSECTIONS,
          title: tParts('lubricationHydraulicsParts'),
          description: tParts('lubricationHydraulicsDescription'),
          machineName,
          machineSerial,
          sectionName: 'Lubrication & Hydraulics',
        }}
        alwaysShowPartsButton
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('sectionTitles.lubricationStatus')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="Lubrication"
              machineName={machineName}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplet className="h-4 w-4" />
                  <Typography variant="muted">{t('labels.oilChanged')}</Typography>
                </div>
                <Badge variant="outline" className={formatYesNo(latestValues.changedOil).className}>
                  {formatYesNo(latestValues.changedOil).text}
                </Badge>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Thermometer className="h-4 w-4" />
                  <Typography variant="muted">{t('labels.oilTemp')}</Typography>
                </div>
                <Typography variant="large">
                  {latestValues.oilTemperature !== null
                    ? `${latestValues.oilTemperature}${latestValues.oilTemperatureUnit === 'CELSIUS' ? '°C' : '°F'}`
                    : '-'}
                </Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Typography variant="muted">{t('labels.oilMfgType')}</Typography>
                <Typography variant="large" className="text-center">
                  {latestValues.oilMfgType || '-'}
                </Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <Typography variant="muted">{t('labels.filterChanged')}</Typography>
                </div>
                <Badge
                  variant="outline"
                  className={formatYesNo(latestValues.changedFilter).className}
                >
                  {formatYesNo(latestValues.changedFilter).text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Oil Temperature Chart */}
          {temperatureChartData.length > 0 && (
            <div className="mt-8">
              <Typography variant="h4" className="mb-4">
                Oil Temperature Trend
              </Typography>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={temperatureChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      label={{
                        value: temperatureChartData[0]?.unit === 'CELSIUS' ? '°C' : '°F',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12 },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(
                        value: number,
                        _name: string,
                        props: { payload?: { unit?: string } },
                      ) => [
                        `${value}${props.payload?.unit === 'CELSIUS' ? '°C' : '°F'}`,
                        'Temperature',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316', strokeWidth: 2 }}
                      name="Oil Temperature"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gauges Table */}
          {latestGauges.length > 0 && (
            <div className="mt-8">
              <Typography variant="h4" className="mb-4">
                System Gauges (Latest Inspection)
              </Typography>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">System</TableHead>
                      <TableHead className="font-semibold">Gauge/Switch ID</TableHead>
                      <TableHead className="text-center font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestGauges.map((gauge, idx) => {
                      const status = formatPsiStatus(gauge.psi);
                      return (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {formatSystemLabel(gauge.system)}
                          </TableCell>
                          <TableCell>{gauge.gaugeSwitchIdentifier || '-'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={status.className}>
                              {status.text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {temperatureChartData.length === 0 && latestGauges.length === 0 && (
            <div className="text-center py-8">
              <Typography variant="muted">{t('labels.noLubricationData')}</Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
