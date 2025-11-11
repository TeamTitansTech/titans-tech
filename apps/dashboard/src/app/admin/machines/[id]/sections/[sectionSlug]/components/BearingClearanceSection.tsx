'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import {
  Calendar as CalendarIcon,
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { InspectionData } from './BearingClearanceSectionWrapper';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF, exportToWord } from '../utils/exportBearingClearance';

interface BearingClearanceSectionProps {
  machineId: string;
  inspections: InspectionData[];
  machineName: string;
}

export function BearingClearanceSection({
  inspections,
  machineName,
}: BearingClearanceSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
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
  const latestBearingCheck = latestInspection?.bearingClearanceChecks?.[0]?.after;

  const chartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.bearingClearanceChecks?.[0]?.after)
      .map((inspection) => {
        const after = inspection.bearingClearanceChecks[0].after!;
        const before = inspection.bearingClearanceChecks[0].before;

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
              <CardTitle>{t('connectionBearingClearance')}</CardTitle>
              <DropdownMenu
                open={isExportDropdownOpen}
                onOpenChange={setIsExportDropdownOpen}
                modal={false}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {t('exportData')}
                    <ChevronDown className="w-4 h-4 ml-2" />
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
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <div className="aspect-square bg-background rounded border-2 border-dashed border-border flex items-center justify-center">
                    <Typography variant="muted">{t('measurementDiagram')}</Typography>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <Typography variant="small" className="flex-1">
                        {t('slideMotorMounts')}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        -
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <Typography variant="small" className="flex-1">
                        {t('powerCordHoses')}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        -
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
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
                <Tabs defaultValue="area" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="area">{t('areaChart')}</TabsTrigger>
                    <TabsTrigger value="bar">{t('barChart')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="area" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {t('chartConnectionBearing')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorCBRH" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCBLH" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Area
                                type="linear"
                                dataKey="CB RH"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorCBRH)"
                              />
                              <Area
                                type="linear"
                                dataKey="CB LH"
                                stroke="#82ca9d"
                                fillOpacity={1}
                                fill="url(#colorCBLH)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="aspect-video bg-muted rounded flex items-center justify-center">
                            <Typography variant="muted">{t('noDataAvailable')}</Typography>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {t('chartDifference')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorDiffRH" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDiffLH" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#ff7300" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Area
                                type="linear"
                                dataKey="Difference RH"
                                stroke="#ffc658"
                                fillOpacity={1}
                                fill="url(#colorDiffRH)"
                              />
                              <Area
                                type="linear"
                                dataKey="Difference LH"
                                stroke="#ff7300"
                                fillOpacity={1}
                                fill="url(#colorDiffLH)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="aspect-video bg-muted rounded flex items-center justify-center">
                            <Typography variant="muted">{t('noDataAvailable')}</Typography>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bar" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {t('chartConnectionBearing')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="CB RH" fill="#8884d8" />
                              <Bar dataKey="CB LH" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="aspect-video bg-muted rounded flex items-center justify-center">
                            <Typography variant="muted">{t('noDataAvailable')}</Typography>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {t('chartDifference')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Difference RH" fill="#ffc658" />
                              <Bar dataKey="Difference LH" fill="#ff7300" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="aspect-video bg-muted rounded flex items-center justify-center">
                            <Typography variant="muted">{t('noDataAvailable')}</Typography>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
