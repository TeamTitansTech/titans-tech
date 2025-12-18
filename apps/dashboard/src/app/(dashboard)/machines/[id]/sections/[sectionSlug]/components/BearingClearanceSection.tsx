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
import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { getBearingClearanceThresholdByBlueprint } from '@/actions/alerts';
import type { ThresholdConfig, MultiLineMeasurementData } from '@/components/charts/types';
import { useUnitManager } from '@/contexts/UnitManagerContext';

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
  // Use global unit context
  const { lengthUnit, setLengthUnit, convertLengthFromDefault, getLengthUnitLabel } =
    useUnitManager();
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

  // Filter to only inspections that have bearing clearance data
  const inspectionsWithBearingData = useMemo(() => {
    return filteredInspections.filter((inspection) => inspection.bearingClearance?.[0]?.outerData);
  }, [filteredInspections]);

  // Find the latest inspection that actually has bearing clearance data (not just any inspection)
  const latestInspectionWithData = useMemo(() => {
    return inspectionsWithBearingData[0];
  }, [inspectionsWithBearingData]);

  const latestBearingCheck = latestInspectionWithData?.bearingClearance?.[0]?.outerData;

  // Convert value using global unit context (data stored in mm)
  const convertValue = useCallback(
    (value: number | null): number | null => {
      if (value === null) return null;
      return convertLengthFromDefault(value);
    },
    [convertLengthFromDefault],
  );

  // Convert threshold using global unit context (thresholds stored in mm)
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

  // Convert chart data using global unit context (data stored in mm)
  const convertChartData = useCallback(
    (data: MultiLineMeasurementData[], keys: string[]): MultiLineMeasurementData[] => {
      return data.map((point) => {
        const converted = { ...point };
        keys.forEach((key) => {
          const val = point[key];
          if (typeof val === 'number') {
            converted[key] = convertLengthFromDefault(val);
          }
        });
        return converted;
      });
    },
    [convertLengthFromDefault],
  );

  // Get converted thresholds
  const cbThresholdConverted = useMemo(
    () => convertThreshold(cbThreshold),
    [convertThreshold, cbThreshold],
  );
  const totalClearanceThresholdConverted = useMemo(
    () => convertThreshold(totalClearanceThreshold),
    [convertThreshold, totalClearanceThreshold],
  );

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

  // Get converted chart data
  const cbChartDataConverted = useMemo(
    () =>
      convertChartData(cbChartData, ['upperConnectionBearings_RH', 'upperConnectionBearings_LH']),
    [convertChartData, cbChartData],
  );

  const totalClearanceChartDataConverted = useMemo(
    () => convertChartData(totalClearanceChartData, ['totalClearance_RH', 'totalClearance_LH']),
    [convertChartData, totalClearanceChartData],
  );

  const formatValue = (value: number | null | undefined, decimals = 4): string => {
    if (value === null || value === undefined) return '-';
    const converted = convertValue(value as number);
    if (converted === null) return '-';
    return converted.toFixed(decimals);
  };

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
        inspectionsWithBearingData.length,
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
        inspectionsWithBearingData.length,
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
        inspectionsWithBearingData.length,
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
              <Typography variant="large">{inspectionsWithBearingData.length}</Typography>
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
              <CardTitle>{t('connectionBearingClearance')}</CardTitle>
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
                      ? `${formatValue(Number(latestBearingCheck.mainBearings_LH))} / ${formatValue(Number(latestBearingCheck.mainBearings_RH))}`
                      : '-'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    UCB (Upper Connection)
                  </Typography>
                  <Typography variant="large">
                    {latestBearingCheck
                      ? `${formatValue(Number(latestBearingCheck.upperConnectionBearings_LH))} / ${formatValue(Number(latestBearingCheck.upperConnectionBearings_RH))}`
                      : '-'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted" className="mb-1">
                    TC (Total Clearance)
                  </Typography>
                  <Typography variant="large">
                    {latestBearingCheck
                      ? `${formatValue(Number(latestBearingCheck.totalClearance_LH))} / ${formatValue(Number(latestBearingCheck.totalClearance_RH))}`
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
                  data={cbChartDataConverted}
                  lines={[
                    {
                      dataKey: 'upperConnectionBearings_RH',
                      label: 'CB RH',
                      color: '#8884d8',
                    },
                    {
                      dataKey: 'upperConnectionBearings_LH',
                      label: 'CB LH',
                      color: '#06b6d4',
                    },
                  ]}
                  sharedThreshold={cbThresholdConverted}
                  valueUnit={getLengthUnitLabel()}
                  allowToggle={true}
                  height={300}
                />

                <MultiLineThresholdChart
                  title={t('chartTotalClearance') || 'Total Clearance'}
                  data={totalClearanceChartDataConverted}
                  lines={[
                    {
                      dataKey: 'totalClearance_RH',
                      label: 'TC RH',
                      color: '#3b82f6',
                    },
                    {
                      dataKey: 'totalClearance_LH',
                      label: 'TC LH',
                      color: '#ec4899',
                    },
                  ]}
                  sharedThreshold={totalClearanceThresholdConverted}
                  valueUnit={getLengthUnitLabel()}
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
