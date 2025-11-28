'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import {
  ClipboardCheck,
  Calendar as CalendarIcon,
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { InspectionCreationModal } from '@/app/s/[subdomain]/machines/[id]/components/InspectionCreationModal';
import { InspectionData } from './BearingClearanceSectionWrapper';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF, exportToWord } from '../utils/exportBearingClearance';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import {
  transformBearingClearanceToMultiLineData,
  extractThresholdConfig,
} from '@/components/charts/dataTransformers';
import { getThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig } from '@/components/charts/types';

interface BearingClearanceSectionProps {
  machineId: string;
  inspections: InspectionData[];
  machineName: string;
  blueprintId: string;
}

export function BearingClearanceSection({
  machineId,
  inspections,
  machineName,
  blueprintId,
}: BearingClearanceSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
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
        const response = await getThresholdByBlueprint(blueprintId);
        if (response.data) {
          // Extract thresholds for each measurement type
          setCbThreshold(extractThresholdConfig(response.data, 'upperConnectionBearings'));
          setTotalClearanceThreshold(extractThresholdConfig(response.data, 'totalClearance'));
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

  const latestInspection = filteredInspections[0];
  const latestBearingCheck = latestInspection?.bearingClearance?.[0]?.outerData;

  // Transform data for new threshold charts
  const cbChartData = useMemo(() => {
    const data = transformBearingClearanceToMultiLineData(
      filteredInspections,
      'upperConnectionBearings',
    );
    return data;
  }, [filteredInspections]);

  const totalClearanceChartData = useMemo(() => {
    const data = transformBearingClearanceToMultiLineData(filteredInspections, 'totalClearance');
    return data;
  }, [filteredInspections]);

  // Keep old chartData format for export functions compatibility
  const chartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.bearingClearance?.[0]?.outerData)
      .map((inspection) => {
        const after = inspection.bearingClearance[0]!.outerData!;
        const before = inspection.bearingClearance[0]!.outerBefore;

        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          'CB RH': Number(after.upperConnectionBearings_RH),
          'CB LH': Number(after.upperConnectionBearings_LH),
          'Difference RH': before
            ? Number(after.totalClearance_RH) - Number(before.totalClearance_RH)
            : 0,
          'Difference LH': before
            ? Number(after.totalClearance_LH) - Number(before.totalClearance_LH)
            : 0,
        };
      })
      .reverse();
  }, [filteredInspections]);

  const handleExportPDF = async () => {
    toast.promise(
      exportToPDF(
        machineName,
        date,
        filteredInspections.length,
        latestBearingCheck ?? undefined,
        chartData,
      ),
      {
        loading: t('exportingToPDF'),
        success: t('exportedPDFSuccess'),
        error: t('exportPDFError'),
      },
    );
  };

  const handleExportWord = async () => {
    toast.promise(
      exportToWord(
        machineName,
        date,
        filteredInspections.length,
        latestBearingCheck ?? undefined,
        chartData,
      ),
      {
        loading: t('exportingToWord'),
        success: t('exportedWordSuccess'),
        error: t('exportWordError'),
      },
    );
  };

  const handleExportExcel = async () => {
    toast.promise(
      exportToExcel(
        machineName,
        date,
        filteredInspections.length,
        latestBearingCheck ?? undefined,
        chartData,
      ),
      {
        loading: t('exportingToExcel'),
        success: t('exportedExcelSuccess'),
        error: t('exportExcelError'),
      },
    );
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
            <CardTitle>{t('connectionBearingClearance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <Typography variant="h3" className="mb-2">
                LH / RH
              </Typography>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Typography variant="muted" className="mb-1">
                    MB (Main Bearings)
                  </Typography>
                  <Typography variant="large">
                    {latestBearingCheck
                      ? `${Number(latestBearingCheck.mainBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.mainBearings_RH).toFixed(4)}`
                      : '-'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    UCB (Upper Connection)
                  </Typography>
                  <Typography variant="large">
                    {latestBearingCheck
                      ? `${Number(latestBearingCheck.upperConnectionBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.upperConnectionBearings_RH).toFixed(4)}`
                      : '-'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    TC (Total Clearance)
                  </Typography>
                  <Typography variant="large">
                    {latestBearingCheck
                      ? `${Number(latestBearingCheck.totalClearance_LH).toFixed(4)} / ${Number(latestBearingCheck.totalClearance_RH).toFixed(4)}`
                      : '-'}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-1/3 flex-shrink-0">
                <div className="bg-muted rounded-lg p-6 space-y-4 h-full">
                  <div className="aspect-square bg-background rounded border-2 border-dashed border-border flex items-center justify-center">
                    <Typography variant="muted">{t('measurementDiagram')}</Typography>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <Typography variant="small" className="flex-1">
                        {t('slideMotorMounts')}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        -
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <Typography variant="small" className="flex-1">
                        {t('powerCordHoses')}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        -
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <Typography variant="small" className="flex-1">
                        {t('chainsGearsSprockets')}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        -
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <MultiLineThresholdChart
                  title={t('chartConnectionBearing')}
                  data={cbChartData}
                  lines={[
                    {
                      dataKey: 'upperConnectionBearings_RH',
                      label: 'CB RH',
                      color: '#8884d8',
                    },
                    {
                      dataKey: 'upperConnectionBearings_LH',
                      label: 'CB LH',
                      color: '#82ca9d',
                    },
                  ]}
                  sharedThreshold={cbThreshold}
                  valueUnit="mm"
                  allowToggle={true}
                  height={300}
                />

                <MultiLineThresholdChart
                  title={t('chartTotalClearance') || 'Total Clearance'}
                  data={totalClearanceChartData}
                  lines={[
                    {
                      dataKey: 'totalClearance_RH',
                      label: 'TC RH',
                      color: '#ffc658',
                    },
                    {
                      dataKey: 'totalClearance_LH',
                      label: 'TC LH',
                      color: '#ff7300',
                    },
                  ]}
                  sharedThreshold={totalClearanceThreshold}
                  valueUnit="mm"
                  allowToggle={true}
                  height={300}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <DropdownMenu open={isExportDropdownOpen} onOpenChange={setIsExportDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {t('exportData')}
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    isExportDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="overflow-visible data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-150 data-[state=closed]:duration-100"
            >
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                {t('exportAsPDF')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord}>
                <FileText className="w-4 h-4 mr-2" />
                {t('exportAsWord')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {t('exportAsExcel')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
