'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import { ClipboardCheck, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { InspectionCreationModal } from '../../../components/InspectionCreationModal';
import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface BearingClearanceSectionProps {
  machineId: string;
}

interface BearingClearanceData {
  totalClearance_RH: number;
  totalClearance_LH: number;
  mainBearings_RH: number;
  mainBearings_LH: number;
  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
}

interface InspectionData {
  id: string;
  date: string;
  bearingClearanceChecks: Array<{
    id: string;
    after: BearingClearanceData | null;
    before: BearingClearanceData | null;
  }>;
}

export function BearingClearanceSection({ machineId }: BearingClearanceSectionProps) {
  const t = useTranslations('machines.sectionDetails');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await getInspectionsByMachine(machineId);
        if (response.data) {
          setInspections(response.data as unknown as InspectionData[]);


          if (response.data.length > 0) {
            const dates = response.data.map((i: any) => new Date(i.date));
            setDate({
              from: new Date(Math.min(...dates.map((d) => d.getTime()))),
              to: new Date(Math.max(...dates.map((d) => d.getTime()))),
            });
          }
        }
      } catch (error) {
        console.error('Error fetching inspections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [machineId]);


  const filteredInspections = inspections.filter((inspection) => {
    const inspectionDate = new Date(inspection.date);
    if (date?.from && inspectionDate < date.from) return false;
    if (date?.to && inspectionDate > date.to) return false;
    return true;
  });


  const latestInspection = filteredInspections[0];
  const latestBearingCheck = latestInspection?.bearingClearanceChecks?.[0]?.after;


  const chartData = filteredInspections
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

  if (loading) {
    return <div className="flex items-center justify-center p-12">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('press')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="large">-</Typography>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dateRange')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      size="sm"
                      className={cn(
                        'w-full justify-start text-left font-normal h-8',
                        !date && 'text-muted-foreground'
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    if (inspections.length > 0) {
                      const dates = inspections.map((i) => new Date(i.date));
                      setDate({
                        from: new Date(Math.min(...dates.map((d) => d.getTime()))),
                        to: new Date(Math.max(...dates.map((d) => d.getTime()))),
                      });
                    }
                  }}
                >
                  {t('reset')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Bearing Clearance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('connectionBearingClearance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Measurements */}
              <div>
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <div className="text-center mb-6">
                    <Typography variant="h3" className="mb-2">LH / RH</Typography>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Typography variant="muted" className="mb-1">MB (Main Bearings)</Typography>
                        <Typography variant="large">
                          {latestBearingCheck
                            ? `${Number(latestBearingCheck.mainBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.mainBearings_RH).toFixed(4)}`
                            : '-'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="muted" className="mb-1">UCB (Upper Connection)</Typography>
                        <Typography variant="large">
                          {latestBearingCheck
                            ? `${Number(latestBearingCheck.upperConnectionBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.upperConnectionBearings_RH).toFixed(4)}`
                            : '-'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="muted" className="mb-1">TC (Total Clearance)</Typography>
                        <Typography variant="large">
                          {latestBearingCheck
                            ? `${Number(latestBearingCheck.totalClearance_LH).toFixed(4)} / ${Number(latestBearingCheck.totalClearance_RH).toFixed(4)}`
                            : '-'}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder for measurement diagram */}
                  <div className="aspect-square bg-background rounded border-2 border-dashed border-border flex items-center justify-center">
                    <Typography variant="muted">{t('measurementDiagram')}</Typography>
                  </div>

                  {/* Component Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <Typography variant="small" className="flex-1">{t('slideMotorMounts')}</Typography>
                      <Typography variant="small" className="text-muted-foreground">-</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <Typography variant="small" className="flex-1">{t('powerCordHoses')}</Typography>
                      <Typography variant="small" className="text-muted-foreground">-</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <Typography variant="small" className="flex-1">{t('chainsGearsSprockets')}</Typography>
                      <Typography variant="small" className="text-muted-foreground">-</Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Charts */}
              <div className="space-y-4">
                {/* Chart 1: Connection Bearing Clearance */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{t('chartConnectionBearing')}</CardTitle>
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
                            type="monotone"
                            dataKey="CB RH"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorCBRH)"
                          />
                          <Area
                            type="monotone"
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

                {/* Chart 2: Difference */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{t('chartDifference')}</CardTitle>
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
                            type="monotone"
                            dataKey="Difference RH"
                            stroke="#ffc658"
                            fillOpacity={1}
                            fill="url(#colorDiffRH)"
                          />
                          <Area
                            type="monotone"
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">{t('exportData')}</Button>
          <Button onClick={() => setIsInspectionModalOpen(true)}>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            {t('../machines:createInspection')}
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
