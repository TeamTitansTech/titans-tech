'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon, CheckCircle, MinusCircle, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { DieCushionInspectionData } from './DieCushionSectionWrapper';
import { SectionExportButton } from '@/components/shared/SectionExportButton';

interface DieCushionSectionProps {
  machineId: string;
  inspections: DieCushionInspectionData[];
  machineName: string;
}

export function DieCushionSection({ inspections, machineName }: DieCushionSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tEnums = useTranslations('inspections.form.enums');
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

  // Filter inspections to only include those with die cushion data
  const inspectionsWithData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) =>
        inspection.dieCushion?.[0]?.airLeaks !== null ||
        inspection.dieCushion?.[0]?.pneumaticsPlumbing !== null ||
        inspection.dieCushion?.[0]?.lubrication !== null,
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has die cushion data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithData[0];
  }, [inspectionsWithData]);

  const latestData = latestInspectionWithData?.dieCushion?.[0];

  const getStatusBadge = (
    value: string | null | undefined,
    type: 'airLeaks' | 'pneumaticsPlumbing' | 'lubrication',
  ) => {
    if (!value) return <Badge variant="outline">-</Badge>;

    const isOk = value === 'OK';
    const isNa = value === 'NA';
    const isDnc = value === 'DNC';
    const isLeaking = value === 'LEAKING';
    const isNotOperational = value === 'NOT_OPERATIONAL';

    // Get translated label
    let label = value;
    try {
      const enumKey =
        type === 'airLeaks'
          ? 'dieCushionAirLeaks'
          : type === 'pneumaticsPlumbing'
            ? 'dieCushionPneumaticsPlumbing'
            : 'dieCushionLubrication';
      label = tEnums(`${enumKey}.${value.toLowerCase()}`);
    } catch {
      label = value;
    }

    if (isOk) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      );
    }
    if (isNa) {
      return (
        <Badge variant="secondary">
          <MinusCircle className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      );
    }
    if (isDnc) {
      return (
        <Badge variant="secondary">
          <MinusCircle className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      );
    }
    if (isLeaking || isNotOperational) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      );
    }
    return <Badge variant="outline">{label}</Badge>;
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
            <Typography variant="large">{inspectionsWithData.length}</Typography>
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
            <CardTitle>{t('sectionTitles.dieCushionStatus')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="Die Cushion"
              machineName={machineName}
            />
          </div>
        </CardHeader>
        <CardContent>
          {inspectionsWithData.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="muted">{t('labels.noDieCushionData')}</Typography>
            </div>
          ) : (
            <>
              {/* Status Grid */}
              <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Air Leaks */}
                  <div className="space-y-2">
                    <Typography variant="small" className="text-muted-foreground font-medium">
                      {t('labels.airLeaks')}
                    </Typography>
                    <div>{getStatusBadge(latestData?.airLeaks, 'airLeaks')}</div>
                    {latestData?.airLeaks === 'LEAKING' && latestData?.airLeaksLocation && (
                      <div className="mt-2">
                        <Typography variant="small" className="text-muted-foreground">
                          {t('labels.airLeaksLocation')}:
                        </Typography>
                        <Typography variant="p" className="text-sm mt-1">
                          {latestData.airLeaksLocation}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Pneumatics/Plumbing */}
                  <div className="space-y-2">
                    <Typography variant="small" className="text-muted-foreground font-medium">
                      {t('labels.pneumaticsPlumbing')}
                    </Typography>
                    <div>
                      {getStatusBadge(latestData?.pneumaticsPlumbing, 'pneumaticsPlumbing')}
                    </div>
                  </div>

                  {/* Lubrication */}
                  <div className="space-y-2">
                    <Typography variant="small" className="text-muted-foreground font-medium">
                      {t('labels.lubrication')}
                    </Typography>
                    <div>{getStatusBadge(latestData?.lubrication, 'lubrication')}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {latestData?.notes && (
                <div className="mt-6">
                  <Typography variant="h4" className="mb-2">
                    {t('labels.notes')}
                  </Typography>
                  <Card>
                    <CardContent className="pt-4">
                      <Typography variant="p">{latestData.notes}</Typography>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
