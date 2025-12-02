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
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
} from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { CounterbalanceInspectionData } from './CounterbalanceSectionWrapper';
import {
  BarChart,
  Bar,
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
import { COUNTERBALANCE_SUBSECTIONS } from '@/data/parts/section-subsections';

interface CounterbalanceSectionProps {
  machineId: string;
  inspections: CounterbalanceInspectionData[];
  machineName: string;
  machineSerial?: string;
}

interface CounterbalanceData {
  counterbalanceType: string | null;
  airbagPistonSeals: string | null;
  airbagPistonSealsLeakLocation: string | null;
  regulator: string | null;
  gauge: string | null;
  pneumaticsPlumbing: string | null;
  rodSeals: string | null;
  rodBushing: string | null;
  oilWick: string | null;
}

// Fields to check for status (excluding text fields and type)
const STATUS_FIELDS = [
  { key: 'airbagPistonSeals', label: 'Piston Seals' },
  { key: 'regulator', label: 'Regulator' },
  { key: 'gauge', label: 'Gauge' },
  { key: 'pneumaticsPlumbing', label: 'Pneumatics/Plumbing' },
  { key: 'rodSeals', label: 'Rod Seals' },
  { key: 'rodBushing', label: 'Rod Bushing' },
  { key: 'oilWick', label: 'Oil Wick' },
] as const;

export function CounterbalanceSection({
  inspections,
  machineName,
  machineSerial,
}: CounterbalanceSectionProps) {
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

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections, date]);

  const latestInspection = filteredInspections[0];
  const latestOuterData = latestInspection?.counterbalanceCylinderAirbag?.[0]?.outerData;
  const latestInnerData = latestInspection?.counterbalanceCylinderAirbag?.[0]?.innerData;
  const latestAlerts = latestInspection?.alerts || [];

  // Get status info for a value
  const getStatusInfo = (
    value: string | null,
  ): { icon: React.ReactNode; className: string; text: string } => {
    if (!value || value === 'DNC') {
      return {
        icon: <Circle className="h-4 w-4" />,
        className: '',
        text: tCommon('dnc'),
      };
    }
    if (value === 'OK') {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: 'bg-green-100 text-green-800 border-green-200',
        text: tCommon('ok'),
      };
    }
    if (value === 'NA') {
      return {
        icon: <Circle className="h-4 w-4" />,
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        text: tCommon('na'),
      };
    }
    // Issue statuses: LEAKING, NOT_OPERATIONAL, DARK_OIL, NEEDS_REPLACED
    const issueLabels: Record<string, string> = {
      LEAKING: tCommon('leaking'),
      NOT_OPERATIONAL: tCommon('not_operational'),
      DARK_OIL: tCommon('dark_oil'),
      NEEDS_REPLACED: tCommon('needs_replaced'),
    };
    return {
      icon: <XCircle className="h-4 w-4" />,
      className: 'bg-red-100 text-red-800 border-red-200',
      text: issueLabels[value] || value,
    };
  };

  // Count issues in a data set
  const countIssues = (data: CounterbalanceData | null): number => {
    if (!data) return 0;
    let issues = 0;
    STATUS_FIELDS.forEach(({ key }) => {
      const value = data[key as keyof CounterbalanceData];
      if (value && value !== 'OK' && value !== 'NA' && value !== 'DNC') {
        issues++;
      }
    });
    return issues;
  };

  // Transform data for issues trend chart
  const issuesTrendData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.counterbalanceCylinderAirbag?.[0])
      .map((inspection) => {
        const cbData = inspection.counterbalanceCylinderAirbag[0];
        const outerIssues = countIssues(cbData.outerData);
        const innerIssues = countIssues(cbData.innerData);
        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          outer: outerIssues,
          inner: innerIssues,
          total: outerIssues + innerIssues,
        };
      })
      .reverse();
  }, [filteredInspections]);

  // Get summary counts
  const outerIssuesCount = countIssues(latestOuterData);
  const innerIssuesCount = countIssues(latestInnerData);
  const totalOkCount =
    (latestOuterData ? STATUS_FIELDS.length - outerIssuesCount : 0) +
    (latestInnerData ? STATUS_FIELDS.length - innerIssuesCount : 0);

  // Calculate section status
  const sectionStatus: SectionStatus = useMemo(() => {
    // If there are custom alerts, it's critical
    if (latestAlerts.length > 0) return 'alert';
    // If there are issues, it's a warning
    if (outerIssuesCount + innerIssuesCount > 0) return 'warning';
    // If we have data with no issues, it's ok
    if (latestOuterData || latestInnerData) return 'ok';
    // No data
    return 'unknown';
  }, [latestAlerts.length, outerIssuesCount, innerIssuesCount, latestOuterData, latestInnerData]);

  const formatTypeLabel = (type: string | null): string => {
    if (!type) return '-';
    return type === 'CYLINDER' ? 'Cylinder' : 'Airbag';
  };

  // Render status grid for outer/inner data
  const renderStatusGrid = (data: CounterbalanceData | null, title: string) => {
    if (!data) return null;

    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 font-semibold flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-xs">
            {formatTypeLabel(data.counterbalanceType)}
          </Badge>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATUS_FIELDS.map(({ key, label }) => {
              const value = data[key as keyof CounterbalanceData];
              const status = getStatusInfo(value as string | null);
              return (
                <div key={key} className="flex flex-col gap-1">
                  <Typography variant="muted" className="text-xs">
                    {label}
                  </Typography>
                  <Badge variant="outline" className={cn('justify-center gap-1', status.className)}>
                    {status.icon}
                    {status.text}
                  </Badge>
                </div>
              );
            })}
          </div>
          {data.airbagPistonSeals === 'LEAKING' && data.airbagPistonSealsLeakLocation && (
            <div className="mt-3 pt-3 border-t">
              <Typography variant="muted" className="text-xs">
                Leak Location:{' '}
                <span className="font-medium">{data.airbagPistonSealsLeakLocation}</span>
              </Typography>
            </div>
          )}
        </div>
      </div>
    );
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

      {/* Section Status Card with Parts Modal */}
      <SectionStatusCard
        status={sectionStatus}
        partsConfig={{
          subsections: COUNTERBALANCE_SUBSECTIONS,
          title: tParts('counterbalanceParts'),
          description: tParts('counterbalanceDescription'),
          machineName,
          machineSerial,
          sectionName: 'Counterbalance & Airbag',
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('sectionTitles.counterbalanceStatus')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="Counterbalance"
              machineName={machineName}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="text-center mb-6">
            <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <Typography variant="muted">{tCommon('ok')}</Typography>
                </div>
                <Typography variant="large">{totalOkCount}</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <Typography variant="muted">{t('labels.issues')}</Typography>
                </div>
                <Typography variant="large">{outerIssuesCount + innerIssuesCount}</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  <Typography variant="muted">{t('labels.alerts')}</Typography>
                </div>
                <Typography variant="large">{latestAlerts.length}</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-5 w-5" />
                  <Typography variant="muted">{t('labels.inspections')}</Typography>
                </div>
                <Typography variant="large">{filteredInspections.length}</Typography>
              </div>
            </div>
          </div>

          {/* Custom Alerts Section */}
          {latestAlerts.length > 0 && (
            <div className="mb-6 border-2 border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <Typography variant="large" className="text-red-800 font-semibold">
                    {t('labels.customAlerts')}
                  </Typography>
                </div>
                <Badge variant="destructive">{latestAlerts.length}</Badge>
              </div>
              <div className="p-4 space-y-3 bg-red-50/30">
                {latestAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-white border border-red-200 rounded-md shadow-sm"
                  >
                    <div className="font-semibold text-red-800">
                      {alert.fieldName.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-red-600 mt-1">{alert.justification}</div>
                    <div className="text-xs text-red-400 mt-2">
                      {t('labels.createdAt')}:{' '}
                      {format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outer/Inner Status Grids */}
          <div className="space-y-4 mb-8">
            {renderStatusGrid(latestOuterData ?? null, t('labels.outer'))}
            {renderStatusGrid(latestInnerData ?? null, t('labels.inner'))}
          </div>

          {/* Issues Trend Chart */}
          {issuesTrendData.length > 0 && (
            <div className="mt-8">
              <Typography variant="h4" className="mb-4">
                {t('chartTitles.issuesTrend')}
              </Typography>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issuesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="outer" name="Outer Issues" stackId="a" fill="#f97316" />
                    <Bar dataKey="inner" name="Inner Issues" stackId="a" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Inspection History Table */}
          {filteredInspections.length > 0 && (
            <div className="mt-8">
              <Typography variant="h4" className="mb-4">
                {t('labels.inspectionHistory')}
              </Typography>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">{t('labels.date')}</TableHead>
                      <TableHead className="text-center font-semibold">
                        {t('labels.outerType')}
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        {t('labels.outerIssues')}
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        {t('labels.innerType')}
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        {t('labels.innerIssues')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInspections.slice(0, 10).map((inspection) => {
                      const cbData = inspection.counterbalanceCylinderAirbag?.[0];
                      const outerIssues = countIssues(cbData?.outerData ?? null);
                      const innerIssues = countIssues(cbData?.innerData ?? null);
                      return (
                        <TableRow key={inspection.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {format(new Date(inspection.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatTypeLabel(cbData?.outerData?.counterbalanceType ?? null)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                outerIssues > 0
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }
                            >
                              {outerIssues}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatTypeLabel(cbData?.innerData?.counterbalanceType ?? null)}
                          </TableCell>
                          <TableCell className="text-center">
                            {cbData?.innerData ? (
                              <Badge
                                variant="outline"
                                className={
                                  innerIssues > 0
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-green-100 text-green-800 border-green-200'
                                }
                              >
                                {innerIssues}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!latestOuterData && !latestInnerData && (
            <div className="text-center py-8">
              <Typography variant="muted">{t('labels.noCounterbalanceData')}</Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
