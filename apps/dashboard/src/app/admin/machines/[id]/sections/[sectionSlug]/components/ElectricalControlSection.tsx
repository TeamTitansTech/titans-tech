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
  CheckCircle,
  XCircle,
  MinusCircle,
  HelpCircle,
} from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import type { ElectricalControlInspectionData } from './ElectricalControlSectionWrapper';
import { SectionExportButton } from '@/components/shared/SectionExportButton';

interface ElectricalControlSectionProps {
  machineId: string;
  inspections: ElectricalControlInspectionData[];
  machineName: string;
}

// Checklist items to display
const CHECKLIST_ITEMS = [
  'controlDoorStop',
  'cabinetTemp',
  'incomingLine',
  'fullVoltage',
  'contactor',
  'overloads',
  'transformers',
  'brakeValve',
  'clutchValve',
  'wiring',
  'terminals',
  'twentyFourVBuss',
  'safetyRelays',
] as const;

type ChecklistItem = (typeof CHECKLIST_ITEMS)[number];

export function ElectricalControlSection({
  inspections,
  machineName,
}: ElectricalControlSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const tElectrical = useTranslations('inspections.form.electricalControl');
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

  // Filter inspections to only include those with electrical control data
  const inspectionsWithData = useMemo(() => {
    return filteredInspections.filter(
      (inspection) =>
        inspection.electricalControl?.[0] &&
        Object.values(inspection.electricalControl[0]).some((v) => v !== null),
    );
  }, [filteredInspections]);

  // Find the latest inspection that actually has electrical control data
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithData[0];
  }, [inspectionsWithData]);

  const latestData = latestInspectionWithData?.electricalControl?.[0];

  const getStatusBadge = (value: string | null | undefined) => {
    if (!value) return <Badge variant="outline">-</Badge>;

    switch (value) {
      case 'YES':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('labels.yes')}
          </Badge>
        );
      case 'NO':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t('labels.no')}
          </Badge>
        );
      case 'NA':
        return (
          <Badge variant="secondary">
            <MinusCircle className="w-3 h-3 mr-1" />
            {t('labels.na')}
          </Badge>
        );
      case 'DNC':
        return (
          <Badge variant="secondary">
            <MinusCircle className="w-3 h-3 mr-1" />
            {t('labels.dnc')}
          </Badge>
        );
      case 'CANT_TELL':
        return (
          <Badge variant="outline">
            <HelpCircle className="w-3 h-3 mr-1" />
            {t('labels.cantTell')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  };

  const getChecklistItemLabel = (item: ChecklistItem): string => {
    try {
      return tElectrical(item);
    } catch {
      // Fallback: convert camelCase to Title Case
      return item.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    }
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
            <CardTitle>{t('sectionTitles.electricalControlStatus')}</CardTitle>
            <SectionExportButton
              contentRef={contentRef}
              sectionName="Electrical Control"
              machineName={machineName}
            />
          </div>
        </CardHeader>
        <CardContent>
          {inspectionsWithData.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="muted">{t('labels.noElectricalData')}</Typography>
            </div>
          ) : (
            <>
              {/* Control Information */}
              <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6 mb-6">
                <Typography variant="h4" className="mb-4">
                  {t('labels.controlInfo')}
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Hour Meter */}
                  <div className="space-y-2">
                    <Typography variant="small" className="text-muted-foreground font-medium">
                      {t('labels.hasHourMeter')}
                    </Typography>
                    <div>{getStatusBadge(latestData?.hasHourMeter)}</div>
                    {latestData?.hasHourMeter === 'YES' && latestData?.hourMeterReading && (
                      <div className="mt-2">
                        <Typography variant="small" className="text-muted-foreground">
                          {t('labels.hourMeterReading')}:
                        </Typography>
                        <Typography variant="large" className="mt-1">
                          {latestData.hourMeterReading}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Minster Control */}
                  <div className="space-y-2">
                    <Typography variant="small" className="text-muted-foreground font-medium">
                      {t('labels.isMinsterControl')}
                    </Typography>
                    <div>{getStatusBadge(latestData?.isMinsterControl)}</div>
                    {latestData?.isMinsterControl === 'NO' && latestData?.minsterControlOther && (
                      <div className="mt-2">
                        <Typography variant="small" className="text-muted-foreground">
                          {t('labels.other')}:
                        </Typography>
                        <Typography variant="p" className="text-sm mt-1">
                          {latestData.minsterControlOther}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Electrical Checklist */}
              <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6 mb-6">
                <Typography variant="h4" className="mb-4">
                  {t('labels.electricalChecklist')}
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {CHECKLIST_ITEMS.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <Typography variant="small" className="font-medium">
                        {getChecklistItemLabel(item)}
                      </Typography>
                      <div className="ml-2">
                        {getStatusBadge(latestData?.[item as keyof typeof latestData] as string)}
                      </div>
                    </div>
                  ))}
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
