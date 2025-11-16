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
  ClipboardCheck,
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
import { InspectionCreationModal } from '@/app/s/[subdomain]/machines/[id]/components/InspectionCreationModal';
import { InspectionData } from './GibsSectionWrapper';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF, exportToWord } from '../utils/exportGibs';
import Image from 'next/image';

interface GibsSectionProps {
  machineId: string;
  inspections: InspectionData[];
  machineName: string;
}

export function GibsSection({ machineId, inspections, machineName }: GibsSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
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
  const latestGibsCheck = latestInspection?.gibsChecks?.[0]?.after;

  // Calculate average measurements for chart data
  const chartData = useMemo(() => {
    return filteredInspections
      .filter((inspection) => inspection.gibsChecks?.[0]?.after)
      .map((inspection) => {
        const after = inspection.gibsChecks[0].after!;
        const before = inspection.gibsChecks[0].before;

        // Calculate averages for Front to Back points
        const frontToBackPoints = [
          after.point1,
          after.point2,
          after.point3,
          after.point4,
          after.point5,
          after.point6,
          after.point7,
          after.point8,
          after.point9,
          after.point10,
          after.point11,
          after.point12,
          after.point13,
          after.point14,
          after.point15,
          after.point16,
        ];

        const avgFrontToBack =
          frontToBackPoints.reduce((sum, val) => sum + Number(val), 0) / frontToBackPoints.length;

        // Calculate average for Left/Right
        const leftAvg =
          ((after.leftTop || 0) + (after.leftBottom || 0)) /
          [after.leftTop, after.leftBottom].filter((v) => v !== undefined).length;
        const rightAvg =
          ((after.rightTop || 0) + (after.rightBottom || 0)) /
          [after.rightTop, after.rightBottom].filter((v) => v !== undefined).length;

        return {
          date: format(new Date(inspection.date), 'dd/MM/yyyy'),
          'Avg Front-Back': Number(avgFrontToBack.toFixed(4)),
          'Left Avg': Number(leftAvg.toFixed(4)) || 0,
          'Right Avg': Number(rightAvg.toFixed(4)) || 0,
          Difference: before ? Number((avgFrontToBack - Number(before.point1)).toFixed(4)) : 0,
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
        latestGibsCheck ?? undefined,
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
        latestGibsCheck ?? undefined,
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
        latestGibsCheck ?? undefined,
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
            <CardTitle>{t('gibsMeasurements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 flex-shrink-0">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <Typography variant="h4" className="text-center mb-4">
                    Measurement Diagrams
                  </Typography>

                  {/* Outer Slide Diagram - Before Tool Installation */}
                  <div className="space-y-2">
                    <Typography variant="small" className="font-semibold">
                      Outer Slide (Before Tool Installation)
                    </Typography>
                    <div className="bg-background rounded border-2 border-dashed border-border p-2">
                      <Image
                        src="/assets/gibs/before-tool-instalation.png"
                        alt="Outer Slide Before Tool Installation"
                        width={400}
                        height={300}
                        className="w-full h-auto"
                        priority
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Outer Slide Diagram - After Tool Installation */}
                  <div className="space-y-2">
                    <Typography variant="small" className="font-semibold">
                      Outer Slide (After Tool Installation / Top View)
                    </Typography>
                    <div className="bg-background rounded border-2 border-dashed border-border p-2">
                      <Image
                        src="/assets/gibs/after-tool-instalation.png"
                        alt="Outer Slide After Tool Installation"
                        width={400}
                        height={300}
                        className="w-full h-auto"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Front to Back Diagram */}
                  <div className="space-y-2">
                    <Typography variant="small" className="font-semibold">
                      Front to Back Measurements
                    </Typography>
                    <div className="bg-background rounded border-2 border-dashed border-border p-2">
                      <Image
                        src="/assets/gibs/front-to-back.png"
                        alt="Front to Back Measurements"
                        width={400}
                        height={300}
                        className="w-full h-auto"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Left to Right Diagram */}
                  <div className="space-y-2">
                    <Typography variant="small" className="font-semibold">
                      Left to Right Measurements
                    </Typography>
                    <div className="bg-background rounded border-2 border-dashed border-border p-2">
                      <Image
                        src="/assets/gibs/left-to-right.png"
                        alt="Left to Right Measurements"
                        width={400}
                        height={300}
                        className="w-full h-auto"
                        unoptimized
                      />
                    </div>
                  </div>

                  {latestGibsCheck && (
                    <div className="mt-4 pt-4 border-t">
                      <Typography variant="small" className="font-semibold mb-2">
                        Latest Measurements Summary
                      </Typography>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Left Top:</span>
                          <span className="font-mono">
                            {latestGibsCheck.leftTop
                              ? Number(latestGibsCheck.leftTop).toFixed(4)
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Right Top:</span>
                          <span className="font-mono">
                            {latestGibsCheck.rightTop
                              ? Number(latestGibsCheck.rightTop).toFixed(4)
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adjusted:</span>
                          <span>{latestGibsCheck.hasBeenAdjusted || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                          {t('chartGibsMeasurements')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorAvgFB" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Area
                                type="linear"
                                dataKey="Avg Front-Back"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorAvgFB)"
                              />
                              <Area
                                type="linear"
                                dataKey="Left Avg"
                                stroke="#82ca9d"
                                fillOpacity={1}
                                fill="url(#colorLeft)"
                              />
                              <Area
                                type="linear"
                                dataKey="Right Avg"
                                stroke="#ffc658"
                                fillOpacity={1}
                                fill="url(#colorRight)"
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
                                <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
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
                                dataKey="Difference"
                                stroke="#ff7300"
                                fillOpacity={1}
                                fill="url(#colorDiff)"
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
                          {t('chartGibsMeasurements')}
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
                              <Bar dataKey="Avg Front-Back" fill="#8884d8" />
                              <Bar dataKey="Left Avg" fill="#82ca9d" />
                              <Bar dataKey="Right Avg" fill="#ffc658" />
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
                              <Bar dataKey="Difference" fill="#ff7300" />
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
