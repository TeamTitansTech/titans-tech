'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type {
  LatestReport,
  LatestBearingClearance,
  BearingClearanceData,
  LatestClutch,
  ClutchData,
  LatestSlide,
  SlideData,
  GibsStageData,
} from '@/data/types/services.types';
import { BEARING_FIELD_NAMES, BEARING_FIELD_LABELS } from '@titans-tech/shared/types';

interface LatestReportModalProps {
  report: LatestReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LatestReportModal({ report, open, onOpenChange }: LatestReportModalProps) {
  // Get severity badge color and text
  const getSeverityBadge = (severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED') => {
    switch (severity) {
      case 'RED':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'YELLOW':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Atenção</Badge>;
      case 'GREEN':
      case 'NONE':
        return <Badge className="bg-green-500 hover:bg-green-600">OK</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  // Extract bearing clearance measurement rows for outer or inner
  const extractBearingRows = (
    data: BearingClearanceData | undefined,
    alert: LatestBearingClearance['alert'] | undefined,
    prefix: 'outer' | 'inner',
  ) => {
    if (!data) return [];

    return BEARING_FIELD_NAMES.map((field) => {
      // Type-safe access to RH/LH values for calculating differential if no alert
      const lhKey = `${field}_LH` as keyof BearingClearanceData;
      const rhKey = `${field}_RH` as keyof BearingClearanceData;
      const lh = data[lhKey] as number | undefined;
      const rh = data[rhKey] as number | undefined;

      // Type-safe access to alert data with outer_/inner_ prefix
      const differentialKey = `${prefix}_${field}_differential` as keyof NonNullable<typeof alert>;
      const severityKey = `${prefix}_${field}_severity` as keyof NonNullable<typeof alert>;

      const differential = alert
        ? (alert[differentialKey] as number | undefined)
        : lh !== undefined && rh !== undefined
          ? Math.abs(Number(rh) - Number(lh))
          : undefined;

      const severity = alert
        ? (alert[severityKey] as 'NONE' | 'GREEN' | 'YELLOW' | 'RED')
        : ('NONE' as const);

      return {
        field: BEARING_FIELD_LABELS[field],
        differential: typeof differential === 'number' ? differential.toFixed(3) : '-',
        severity,
      };
    });
  };

  // Extract clutch measurement rows
  const extractClutchRows = (data: ClutchData, alert?: LatestClutch['alert']) => {
    const clutchFields = [
      {
        key: 'hydClutchClearanceTotal',
        label: 'Hyd. Clutch Clearance Total',
        value: data.hydClutchClearanceTotal,
      },
      {
        key: 'hydClutchClearanceRear',
        label: 'Hyd. Clutch Clearance Rear',
        value: data.hydClutchClearanceRear,
      },
      {
        key: 'fb',
        label: 'F-B (Front-Back)',
        value: data.brakeSpringFB,
      },
      {
        key: 'fTB',
        label: 'F-TB (Front Top-Bottom)',
        value: data.brakeSpringFTB,
      },
      {
        key: 'rTB',
        label: 'R-TB (Rear Top-Bottom)',
        value: data.brakeSpringRTB,
      },
    ];

    return clutchFields.map((field) => {
      // Handle Decimal values from Prisma (could be number, string, or object)
      let numericValue: number | undefined;
      if (field.value !== null && field.value !== undefined) {
        numericValue = typeof field.value === 'number' ? field.value : Number(field.value);
      }

      const severity = alert
        ? (alert[`${field.key}_severity` as keyof typeof alert] as
            | 'NONE'
            | 'GREEN'
            | 'YELLOW'
            | 'RED')
        : ('NONE' as const);

      return {
        field: field.label,
        value: numericValue !== undefined && !isNaN(numericValue) ? numericValue.toFixed(3) : '-',
        differential: '-', // Clutch doesn't use differential (single values, not before/after)
        severity,
      };
    });
  };

  const bearingClearance = report.sections.BEARING_CLEARANCE;
  const clutch = report.sections.CLUTCH;
  const slide = report.sections.SLIDE;
  const gibs = report.sections.GIBS;

  // Get overall worst severity for bearing clearance (outer or inner)
  const getBearingSeverity = (prefix: 'outer' | 'inner'): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!bearingClearance?.alert) return 'NONE';

    const alert = bearingClearance.alert;
    const severities =
      prefix === 'outer'
        ? new Set([
            alert.outer_totalClearance_severity,
            alert.outer_mainBearings_severity,
            alert.outer_upperConnectionBearings_severity,
            alert.outer_wristPinToMatingPart_severity,
            alert.outer_wristPinToBushing_severity,
            alert.outer_slideAdjNutToScrewSleeve_severity,
          ])
        : new Set([
            alert.inner_totalClearance_severity,
            alert.inner_mainBearings_severity,
            alert.inner_upperConnectionBearings_severity,
            alert.inner_wristPinToMatingPart_severity,
            alert.inner_wristPinToBushing_severity,
            alert.inner_slideAdjNutToScrewSleeve_severity,
          ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'GREEN';
  };

  // Get overall worst severity for bearing clearance (both outer and inner)
  const getOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    const outerSeverity = getBearingSeverity('outer');
    const innerSeverity = getBearingSeverity('inner');

    if (outerSeverity === 'RED' || innerSeverity === 'RED') return 'RED';
    if (outerSeverity === 'YELLOW' || innerSeverity === 'YELLOW') return 'YELLOW';
    if (outerSeverity === 'GREEN' || innerSeverity === 'GREEN') return 'GREEN';
    return 'GREEN';
  };

  // Get overall worst severity for clutch
  const getClutchOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!clutch?.alert) return 'NONE';

    const severities = new Set([
      clutch.alert.hydClutchClearanceTotal_severity,
      clutch.alert.hydClutchClearanceRear_severity,
      clutch.alert.fb_severity,
      clutch.alert.fTB_severity,
      clutch.alert.rTB_severity,
    ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'NONE';
  };

  // Get overall worst severity for slide
  const getSlideOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!slide?.alert) return 'NONE';

    const severities = new Set([
      slide.alert.maxDeviationOuter_severity,
      slide.alert.maxDeviationInner_severity,
    ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'NONE';
  };

  // Extract slide measurement rows
  const extractSlideRows = (
    data: { outerData?: SlideData; innerData?: SlideData },
    alert?: LatestSlide['alert'],
  ) => {
    const sections = [
      {
        name: 'Outer',
        positions: [
          data.outerData?.position1,
          data.outerData?.position2,
          data.outerData?.position3,
          data.outerData?.position4,
          data.outerData?.position5,
        ],
        maxDeviation: alert?.maxDeviationOuter_differential,
        severity: alert?.maxDeviationOuter_severity || 'NONE',
      },
      {
        name: 'Inner',
        positions: [
          data.innerData?.position1,
          data.innerData?.position2,
          data.innerData?.position3,
          data.innerData?.position4,
          data.innerData?.position5,
        ],
        maxDeviation: alert?.maxDeviationInner_differential,
        severity: alert?.maxDeviationInner_severity || 'NONE',
      },
    ];

    return sections;
  };

  // Get overall worst severity for GIBS
  const getGibsOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!gibs?.alert) return 'NONE';
    return gibs.alert.usable_severity;
  };

  // Extract GIBS measurement points
  const extractGibsPoints = (data: GibsStageData) => {
    const toFixed = (val: number | null | undefined) => {
      if (val === null || val === undefined) return '-';
      const num = typeof val === 'number' ? val : Number(val);
      return isNaN(num) ? '-' : num.toFixed(3);
    };

    return [
      { label: 'Point 1', value: toFixed(data.point1) },
      { label: 'Point 2', value: toFixed(data.point2) },
      { label: 'Point 3', value: toFixed(data.point3) },
      { label: 'Point 4', value: toFixed(data.point4) },
      { label: 'Point 5', value: toFixed(data.point5) },
      { label: 'Point 6', value: toFixed(data.point6) },
      { label: 'Point 7', value: toFixed(data.point7) },
      { label: 'Point 8', value: toFixed(data.point8) },
      { label: 'Point 9', value: toFixed(data.point9) },
      { label: 'Point 10', value: toFixed(data.point10) },
      { label: 'Point 11', value: toFixed(data.point11) },
      { label: 'Point 12', value: toFixed(data.point12) },
      { label: 'Point 13', value: toFixed(data.point13) },
      { label: 'Point 14', value: toFixed(data.point14) },
      { label: 'Point 15', value: toFixed(data.point15) },
      { label: 'Point 16', value: toFixed(data.point16) },
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatório Atualizado - {report.machineName}
          </DialogTitle>
          <DialogDescription>
            Modelo: {report.blueprint.name} · Última atualização:{' '}
            {format(new Date(report.generatedAt), 'dd/MM/yyyy', { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4">
          {bearingClearance || clutch || slide || gibs ? (
            <div className="space-y-4">
              {bearingClearance && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="h4" className="font-semibold">
                      Bearing Clearance - CP 2
                    </Typography>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(getOverallSeverity())}
                      <span className="text-sm text-muted-foreground">
                        Atualizado em{' '}
                        {format(new Date(bearingClearance.latestServiceDate), 'dd-MM-yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Outer Section */}
                    {bearingClearance.outerData && (
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 font-semibold flex items-center justify-between">
                          <span>Outer</span>
                          {getSeverityBadge(getBearingSeverity('outer'))}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold">Measurement</TableHead>
                              <TableHead className="text-center font-semibold">
                                Differential
                              </TableHead>
                              <TableHead className="text-center font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {extractBearingRows(
                              bearingClearance.outerData,
                              bearingClearance.alert,
                              'outer',
                            ).map((row, idx) => (
                              <TableRow key={idx} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{row.field}</TableCell>
                                <TableCell className="text-center">{row.differential}</TableCell>
                                <TableCell className="text-center">
                                  {getSeverityBadge(row.severity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Inner Section */}
                    {bearingClearance.innerData && (
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 font-semibold flex items-center justify-between">
                          <span>Inner</span>
                          {getSeverityBadge(getBearingSeverity('inner'))}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold">Measurement</TableHead>
                              <TableHead className="text-center font-semibold">
                                Differential
                              </TableHead>
                              <TableHead className="text-center font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {extractBearingRows(
                              bearingClearance.innerData,
                              bearingClearance.alert,
                              'inner',
                            ).map((row, idx) => (
                              <TableRow key={idx} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{row.field}</TableCell>
                                <TableCell className="text-center">{row.differential}</TableCell>
                                <TableCell className="text-center">
                                  {getSeverityBadge(row.severity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {clutch && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="h4" className="font-semibold">
                      Clutch
                    </Typography>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(getClutchOverallSeverity())}
                      <span className="text-sm text-muted-foreground">
                        Atualizado em {format(new Date(clutch.latestServiceDate), 'dd-MM-yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Measurement</TableHead>
                          <TableHead className="text-center font-semibold">Value</TableHead>
                          <TableHead className="text-center font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractClutchRows(clutch.data, clutch.alert).map((row, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{row.field}</TableCell>
                            <TableCell className="text-center">{row.value}</TableCell>
                            <TableCell className="text-center">
                              {getSeverityBadge(row.severity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {slide && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="h4" className="font-semibold">
                      Slide
                    </Typography>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(getSlideOverallSeverity())}
                      <span className="text-sm text-muted-foreground">
                        Atualizado em {format(new Date(slide.latestServiceDate), 'dd-MM-yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {extractSlideRows(slide.data, slide.alert).map((section, idx) => (
                      <div key={idx} className="border rounded-md overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 font-semibold flex items-center justify-between">
                          <span>{section.name}</span>
                          {getSeverityBadge(
                            section.severity as 'NONE' | 'GREEN' | 'YELLOW' | 'RED',
                          )}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="text-center font-semibold">Pos 1</TableHead>
                              <TableHead className="text-center font-semibold">Pos 2</TableHead>
                              <TableHead className="text-center font-semibold">Pos 3</TableHead>
                              <TableHead className="text-center font-semibold">Pos 4</TableHead>
                              <TableHead className="text-center font-semibold">Pos 5</TableHead>
                              <TableHead className="text-center font-semibold">
                                Max Deviation
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="hover:bg-muted/30">
                              {section.positions.map((pos, posIdx) => (
                                <TableCell key={posIdx} className="text-center">
                                  {pos !== null && pos !== undefined
                                    ? typeof pos === 'number'
                                      ? pos.toFixed(3)
                                      : Number(pos).toFixed(3)
                                    : '-'}
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-medium">
                                {section.maxDeviation !== null && section.maxDeviation !== undefined
                                  ? typeof section.maxDeviation === 'number'
                                    ? section.maxDeviation.toFixed(3)
                                    : Number(section.maxDeviation).toFixed(3)
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gibs && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="h4" className="font-semibold">
                      GIBS - Outer After Adjustment
                    </Typography>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(getGibsOverallSeverity())}
                      <span className="text-sm text-muted-foreground">
                        Atualizado em {format(new Date(gibs.latestServiceDate), 'dd-MM-yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Display usable value from alert if available */}
                    {gibs.alert && (
                      <div className="border rounded-md p-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Usable Value</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {typeof gibs.alert.usable_value === 'number'
                                ? gibs.alert.usable_value.toFixed(3)
                                : Number(gibs.alert.usable_value).toFixed(3)}
                            </span>
                            {getSeverityBadge(gibs.alert.usable_severity)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display measurement points with diagram */}
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 font-semibold">Measurement Points</div>

                      {/* Mobile layout: Image first, then two columns */}
                      <div className="flex flex-col sm:hidden gap-4 p-4">
                        <div className="flex justify-center items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/assets/gibs/front-to-back.png"
                            alt="GIBS measurement diagram"
                            className="aspect-square max-h-[200px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left column - points 2,1,4,3 */}
                          <div className="space-y-3">
                            {[2, 1, 4, 3].map((pointNum) => {
                              const point = extractGibsPoints(gibs.data)[pointNum - 1];
                              return (
                                <div key={pointNum}>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {point.label}
                                  </div>
                                  <div className="font-medium">{point.value}</div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Right column - points 6,5,8,7 */}
                          <div className="space-y-3">
                            {[6, 5, 8, 7].map((pointNum) => {
                              const point = extractGibsPoints(gibs.data)[pointNum - 1];
                              return (
                                <div key={pointNum}>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {point.label}
                                  </div>
                                  <div className="font-medium">{point.value}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Desktop layout: Left column, image, right column */}
                      <div className="hidden sm:grid grid-cols-7 items-center p-4">
                        {/* Left column - points 2,1,4,3 */}
                        <div className="space-y-3">
                          {[2, 1, 4, 3].map((pointNum) => {
                            const point = extractGibsPoints(gibs.data)[pointNum - 1];
                            return (
                              <div key={pointNum}>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {point.label}
                                </div>
                                <div className="font-medium">{point.value}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Center - image */}
                        <div className="col-span-5 h-full flex justify-center items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/assets/gibs/front-to-back.png"
                            alt="GIBS measurement diagram"
                            className="aspect-square max-h-[250px]"
                          />
                        </div>

                        {/* Right column - points 6,5,8,7 */}
                        <div className="space-y-3">
                          {[6, 5, 8, 7].map((pointNum) => {
                            const point = extractGibsPoints(gibs.data)[pointNum - 1];
                            return (
                              <div key={pointNum}>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {point.label}
                                </div>
                                <div className="font-medium">{point.value}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Second section: Points 9-16 (Left to Right) */}
                    <div className="border rounded-md overflow-hidden mt-3">
                      <div className="bg-muted/30 px-4 py-2 font-semibold">
                        Left to Right Measurements
                      </div>

                      {/* Mobile layout: Image first, then two columns */}
                      <div className="flex flex-col sm:hidden gap-4 p-4">
                        <div className="flex justify-center items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/assets/gibs/left-to-right.png"
                            alt="GIBS Left-to-Right measurement diagram"
                            className="aspect-square max-h-[200px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left column - points 13,9,15,11 */}
                          <div className="space-y-3">
                            {[13, 9, 15, 11].map((pointNum) => {
                              const point = extractGibsPoints(gibs.data)[pointNum - 1];
                              return (
                                <div key={pointNum}>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {point.label}
                                  </div>
                                  <div className="font-medium">{point.value}</div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Right column - points 14,10,16,12 */}
                          <div className="space-y-3">
                            {[14, 10, 16, 12].map((pointNum) => {
                              const point = extractGibsPoints(gibs.data)[pointNum - 1];
                              return (
                                <div key={pointNum}>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {point.label}
                                  </div>
                                  <div className="font-medium">{point.value}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Desktop layout: Left column, image, right column */}
                      <div className="hidden sm:grid grid-cols-7 items-center p-4">
                        {/* Left column - points 13,9,15,11 */}
                        <div className="space-y-3">
                          {[13, 9, 15, 11].map((pointNum) => {
                            const point = extractGibsPoints(gibs.data)[pointNum - 1];
                            return (
                              <div key={pointNum}>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {point.label}
                                </div>
                                <div className="font-medium">{point.value}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Center - image */}
                        <div className="col-span-5 h-full flex justify-center items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/assets/gibs/left-to-right.png"
                            alt="GIBS Left-to-Right measurement diagram"
                            className="aspect-square max-h-[250px]"
                          />
                        </div>

                        {/* Right column - points 14,10,16,12 */}
                        <div className="space-y-3">
                          {[14, 10, 16, 12].map((pointNum) => {
                            const point = extractGibsPoints(gibs.data)[pointNum - 1];
                            return (
                              <div key={pointNum}>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {point.label}
                                </div>
                                <div className="font-medium">{point.value}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <Typography variant="muted">Nenhum dado registrado ainda.</Typography>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 px-4 border-t">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
