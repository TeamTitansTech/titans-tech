'use client';

import { useRef, useState } from 'react';
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
import { Download, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { exportToPDF } from '@/lib/pdfExport';
import type {
  LatestReport,
  LatestBearingClearance,
  BearingClearanceData,
  LatestClutch,
  ClutchData,
  LatestSlideSingleHammer,
  LatestSlideDoubleHammer,
  SlideData,
  GibsStageData,
  CounterbalanceCylinderData,
  LatestPistons,
  LatestBearingClearanceSingleHammer,
} from '@/data/types/services.types';
import { BEARING_FIELD_NAMES, BEARING_FIELD_LABELS } from '@titans-tech/shared/types';
import { UnitManagerProvider, useUnitManager } from '@/contexts/UnitManagerContext';

interface LatestReportModalProps {
  report: LatestReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LatestReportModal({ report, open, onOpenChange }: LatestReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <UnitManagerProvider>
        <LatestReportModalContent report={report} open={open} onOpenChange={onOpenChange} />
      </UnitManagerProvider>
    </Dialog>
  );
}

function LatestReportModalContent({ report, onOpenChange }: LatestReportModalProps) {
  const t = useTranslations('machines.latestReport');
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { lengthUnit, setLengthUnit, convertLengthFromDefault, getLengthUnitLabel } =
    useUnitManager();

  // Helper to convert and format length values for display
  const formatLength = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) return '-';
    return convertLengthFromDefault(num).toFixed(4);
  };

  const unitLabel = getLengthUnitLabel();

  const handleExportPDF = async () => {
    if (!contentRef.current) {
      toast.error(t('exportError'));
      return;
    }

    setIsExporting(true);

    const result = await exportToPDF({
      element: contentRef.current,
      title: `${report.machineName} - ${t('title')}`,
      filename: `${report.machineName}_Relatorio`,
      convertSvgs: false, // LatestReportModal doesn't have Recharts
      pageless: true, // Single page PDF with all content
    });

    if (result.success) {
      toast.success(t('exportSuccess'));
    } else {
      console.error('Error exporting to PDF:', result.error);
      toast.error(t('exportError'));
    }

    setIsExporting(false);
  };

  // Get severity badge color and text
  const getSeverityBadge = (severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED') => {
    switch (severity) {
      case 'RED':
        return <Badge variant="destructive">{t('severity.critical')}</Badge>;
      case 'YELLOW':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{t('severity.warning')}</Badge>;
      case 'GREEN':
        return <Badge className="bg-green-500 hover:bg-green-600">{t('severity.ok')}</Badge>;
      case 'NONE':
        return <Badge variant="outline">{t('severity.normal')}</Badge>;
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
        differential: typeof differential === 'number' ? formatLength(differential) : '-',
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
        value:
          numericValue !== undefined && !isNaN(numericValue) ? formatLength(numericValue) : '-',
        differential: '-', // Clutch doesn't use differential (single values, not before/after)
        severity,
      };
    });
  };

  const bearingClearance = report.sections.BEARING_CLEARANCE;
  const bearingClearanceSingleHammer = report.sections.BEARING_CLEARANCE_SINGLE_HAMMER;
  const clutch = report.sections.CLUTCH;
  const slideSingleHammer = report.sections.SLIDE_SINGLE_HAMMER;
  const slideDoubleHammer = report.sections.SLIDE_DOUBLE_HAMMER;
  const gibs = report.sections.GIBS;
  const lubrication = report.sections.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER;
  const counterbalance = report.sections.COUNTERBALANCE_CYLINDER_AIRBAG;
  const pistons = report.sections.PISTONS;
  const tramming = report.sections.TRAMMING;
  const shimThickness = report.sections.SHIM_THICKNESS;
  const dieCushion = report.sections.DIE_CUSHION;
  const electricalControl = report.sections.ELECTRICAL_CONTROL;
  const perpendicularity = report.sections.PERPENDICULARITY;
  const angularity = report.sections.ANGULARITY;

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

  // Get overall worst severity for bearing clearance single hammer
  const getBearingClearanceSingleHammerOverallSeverity = ():
    | 'NONE'
    | 'GREEN'
    | 'YELLOW'
    | 'RED' => {
    if (!bearingClearanceSingleHammer?.alert) return 'NONE';

    const alert = bearingClearanceSingleHammer.alert;
    const severities = new Set([
      alert.totalClearance_severity,
      alert.mainBearings_severity,
      alert.upperConnectionBearings_severity,
      alert.wristPinToMatingPart_severity,
      alert.wristPinToBushing_severity,
      alert.slideAdjNutToScrewSleeve_severity,
    ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'GREEN';
  };

  // Extract bearing clearance single hammer measurement rows
  const extractBearingClearanceSingleHammerRows = (
    data: BearingClearanceData | undefined,
    alert: LatestBearingClearanceSingleHammer['alert'] | undefined,
  ) => {
    if (!data) return [];

    return BEARING_FIELD_NAMES.map((field) => {
      const lhKey = `${field}_LH` as keyof BearingClearanceData;
      const rhKey = `${field}_RH` as keyof BearingClearanceData;
      const lh = data[lhKey] as number | undefined;
      const rh = data[rhKey] as number | undefined;

      const differentialKey = `${field}_differential` as keyof NonNullable<typeof alert>;
      const severityKey = `${field}_severity` as keyof NonNullable<typeof alert>;

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
        differential: typeof differential === 'number' ? formatLength(differential) : '-',
        severity,
      };
    });
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

  // Get overall worst severity for slide single hammer
  const getSlideSingleHammerOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!slideSingleHammer?.alert) return 'NONE';
    return slideSingleHammer.alert.maxDeviation_severity || 'NONE';
  };

  // Get overall worst severity for slide double hammer
  const getSlideDoubleHammerOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!slideDoubleHammer?.alert) return 'NONE';

    const severities = new Set([
      slideDoubleHammer.alert.maxDeviationOuter_severity,
      slideDoubleHammer.alert.maxDeviationInner_severity,
    ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'NONE';
  };

  // Extract slide single hammer measurement rows
  const extractSlideSingleHammerRows = (
    data: { beforeData?: SlideData; data?: SlideData },
    alert?: LatestSlideSingleHammer['alert'],
  ) => {
    const sections = [
      {
        name: 'Before',
        positions: [
          data.beforeData?.position1,
          data.beforeData?.position2,
          data.beforeData?.position3,
          data.beforeData?.position4,
          data.beforeData?.position5,
        ],
        maxDeviation: null,
        severity: 'NONE' as const,
      },
      {
        name: 'After',
        positions: [
          data.data?.position1,
          data.data?.position2,
          data.data?.position3,
          data.data?.position4,
          data.data?.position5,
        ],
        maxDeviation: alert?.maxDeviation_differential,
        severity: alert?.maxDeviation_severity || 'NONE',
      },
    ];
    return sections.filter((section) => section.positions.some((pos) => pos !== undefined));
  };

  // Extract slide double hammer measurement rows
  const extractSlideDoubleHammerRows = (
    data: {
      outerBefore?: SlideData;
      outerData?: SlideData;
      innerBefore?: SlideData;
      innerData?: SlideData;
    },
    alert?: LatestSlideDoubleHammer['alert'],
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

  // Get overall worst severity for Tramming
  const getTrammingOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!tramming?.alert) return 'NONE';

    const alert = tramming.alert;
    const severities = new Set([
      // Outer
      alert.outer_top_verticalSeverity,
      alert.outer_top_horizontalSeverity,
      alert.outer_bottom_verticalSeverity,
      alert.outer_bottom_horizontalSeverity,
      alert.outer_left_verticalSeverity,
      alert.outer_left_horizontalSeverity,
      alert.outer_right_verticalSeverity,
      alert.outer_right_horizontalSeverity,
      // Inner
      alert.inner_top_verticalSeverity,
      alert.inner_top_horizontalSeverity,
      alert.inner_bottom_verticalSeverity,
      alert.inner_bottom_horizontalSeverity,
      alert.inner_left_verticalSeverity,
      alert.inner_left_horizontalSeverity,
      alert.inner_right_verticalSeverity,
      alert.inner_right_horizontalSeverity,
    ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'NONE';
  };

  // Format Yes/No/DNC values for lubrication
  const formatYesNoDnc = (value: string | undefined | null): string => {
    if (!value) return '-';
    const labels: Record<string, string> = {
      YES: t('yesNoDnc.yes'),
      NO: t('yesNoDnc.no'),
      DNC: t('yesNoDnc.dnc'),
    };
    return labels[value] || value;
  };

  // Format counterbalance status values
  const formatCounterbalanceStatus = (
    value: string | undefined | null,
  ): { text: string; isIssue: boolean } => {
    if (!value || value === 'DNC') return { text: t('counterbalance.status.dnc'), isIssue: false };
    if (value === 'OK') return { text: t('counterbalance.status.ok'), isIssue: false };
    if (value === 'NA') return { text: t('counterbalance.status.na'), isIssue: false };
    // Issue statuses
    const issueLabels: Record<string, string> = {
      LEAKING: t('counterbalance.status.leaking'),
      NOT_OPERATIONAL: t('counterbalance.status.notOperational'),
      DARK_OIL: t('counterbalance.status.darkOil'),
      NEEDS_REPLACED: t('counterbalance.status.needsReplaced'),
    };
    return { text: issueLabels[value] || value, isIssue: true };
  };

  // Count counterbalance issues
  const countCounterbalanceIssues = (data: CounterbalanceCylinderData | undefined): number => {
    if (!data) return 0;
    let issues = 0;
    const fields = [
      'airbagPistonSeals',
      'regulator',
      'gauge',
      'pneumaticsPlumbing',
      'rodSeals',
      'rodBushing',
      'oilWick',
    ];
    fields.forEach((field) => {
      const value = data[field as keyof CounterbalanceCylinderData];
      if (value && value !== 'OK' && value !== 'NA' && value !== 'DNC') {
        issues++;
      }
    });
    return issues;
  };

  // Extract GIBS measurement points
  const extractGibsPoints = (data: GibsStageData) => {
    return [
      { label: 'Point 1', value: formatLength(data.point1) },
      { label: 'Point 2', value: formatLength(data.point2) },
      { label: 'Point 3', value: formatLength(data.point3) },
      { label: 'Point 4', value: formatLength(data.point4) },
      { label: 'Point 5', value: formatLength(data.point5) },
      { label: 'Point 6', value: formatLength(data.point6) },
      { label: 'Point 7', value: formatLength(data.point7) },
      { label: 'Point 8', value: formatLength(data.point8) },
      { label: 'Point 9', value: formatLength(data.point9) },
      { label: 'Point 10', value: formatLength(data.point10) },
      { label: 'Point 11', value: formatLength(data.point11) },
      { label: 'Point 12', value: formatLength(data.point12) },
      { label: 'Point 13', value: formatLength(data.point13) },
      { label: 'Point 14', value: formatLength(data.point14) },
      { label: 'Point 15', value: formatLength(data.point15) },
      { label: 'Point 16', value: formatLength(data.point16) },
    ];
  };

  // Get overall worst severity for pistons (outer or inner)
  const getPistonsSeverity = (prefix: 'outer' | 'inner'): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!pistons?.alert) return 'NONE';

    const alert = pistons.alert;
    const severities =
      prefix === 'outer'
        ? new Set([
            alert.outer_lhLeftRight_severity,
            alert.outer_lhTopBottom_severity,
            alert.outer_rhLeftRight_severity,
            alert.outer_rhTopBottom_severity,
          ])
        : new Set([
            alert.inner_lhLeftRight_severity,
            alert.inner_lhTopBottom_severity,
            alert.inner_rhLeftRight_severity,
            alert.inner_rhTopBottom_severity,
          ]);

    if (severities.has('RED')) return 'RED';
    if (severities.has('YELLOW')) return 'YELLOW';
    if (severities.has('GREEN')) return 'GREEN';
    return 'NONE';
  };

  // Get overall worst severity for pistons (both outer and inner)
  const getPistonsOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    const outerSeverity = getPistonsSeverity('outer');
    const innerSeverity = getPistonsSeverity('inner');

    if (outerSeverity === 'RED' || innerSeverity === 'RED') return 'RED';
    if (outerSeverity === 'YELLOW' || innerSeverity === 'YELLOW') return 'YELLOW';
    if (outerSeverity === 'GREEN' || innerSeverity === 'GREEN') return 'GREEN';
    return 'NONE';
  };

  // Extract pistons sum rows for outer or inner
  const extractPistonsRows = (alert: LatestPistons['alert'], prefix: 'outer' | 'inner') => {
    if (!alert) return [];

    const sumFields = [
      {
        label: 'LH Left + Right',
        diff: prefix === 'outer' ? alert.outer_lhLeftRight_diff : alert.inner_lhLeftRight_diff,
        severity:
          prefix === 'outer' ? alert.outer_lhLeftRight_severity : alert.inner_lhLeftRight_severity,
      },
      {
        label: 'LH Top + Bottom',
        diff: prefix === 'outer' ? alert.outer_lhTopBottom_diff : alert.inner_lhTopBottom_diff,
        severity:
          prefix === 'outer' ? alert.outer_lhTopBottom_severity : alert.inner_lhTopBottom_severity,
      },
      {
        label: 'RH Left + Right',
        diff: prefix === 'outer' ? alert.outer_rhLeftRight_diff : alert.inner_rhLeftRight_diff,
        severity:
          prefix === 'outer' ? alert.outer_rhLeftRight_severity : alert.inner_rhLeftRight_severity,
      },
      {
        label: 'RH Top + Bottom',
        diff: prefix === 'outer' ? alert.outer_rhTopBottom_diff : alert.inner_rhTopBottom_diff,
        severity:
          prefix === 'outer' ? alert.outer_rhTopBottom_severity : alert.inner_rhTopBottom_severity,
      },
    ];

    return sumFields.map((field) => ({
      field: field.label,
      sum: field.diff !== null && field.diff !== undefined ? formatLength(field.diff) : '-',
      severity: field.severity,
    }));
  };

  return (
    <DialogContent className="flex flex-col overflow-hidden">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          {/* Unit Toggle */}
          <div className="flex items-center rounded-md border" data-export-button>
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
        <DialogDescription>
          {report.machineName} · {report.blueprint.name} · {t('updatedAt')}{' '}
          {format(new Date(report.generatedAt), 'dd/MM/yyyy', { locale: ptBR })}
        </DialogDescription>
      </DialogHeader>

      <div ref={contentRef} className="flex-1 overflow-y-auto px-1 py-4">
        {bearingClearance ||
        bearingClearanceSingleHammer ||
        clutch ||
        slideSingleHammer ||
        slideDoubleHammer ||
        gibs ||
        pistons ||
        lubrication ||
        counterbalance ||
        tramming ||
        shimThickness ||
        dieCushion ||
        electricalControl ||
        perpendicularity ||
        angularity ? (
          <div className="space-y-4">
            {bearingClearance && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Bearing Clearance - CP 2
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')}{' '}
                      {format(new Date(bearingClearance.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Outer Section */}
                  {bearingClearance.outerData && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>Outer</span>
                        {getSeverityBadge(getBearingSeverity('outer'))}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Measurement</TableHead>
                            <TableHead className="text-center font-semibold">
                              Differential ({unitLabel})
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
                    <div className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>Inner</span>
                        {getSeverityBadge(getBearingSeverity('inner'))}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Measurement</TableHead>
                            <TableHead className="text-center font-semibold">
                              Differential ({unitLabel})
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
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Clutch
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getClutchOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')} {format(new Date(clutch.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Measurement</TableHead>
                        <TableHead className="text-center font-semibold">
                          Value ({unitLabel})
                        </TableHead>
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

            {slideSingleHammer && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Slide (Single Hammer)
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getSlideSingleHammerOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')}{' '}
                      {format(new Date(slideSingleHammer.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {extractSlideSingleHammerRows(
                    slideSingleHammer.data,
                    slideSingleHammer.alert,
                  ).map((section, idx) => (
                    <div key={idx} className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>{section.name}</span>
                        {getSeverityBadge(section.severity as 'NONE' | 'GREEN' | 'YELLOW' | 'RED')}
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
                          <TableRow className="bg-muted/30">
                            <TableHead
                              colSpan={6}
                              className="py-1 text-center text-xs text-muted-foreground"
                            >
                              ({unitLabel})
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/30">
                            {section.positions.map((pos, posIdx) => (
                              <TableCell key={posIdx} className="text-center">
                                {formatLength(pos as number | null)}
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-medium">
                              {formatLength(section.maxDeviation as number | null)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slideDoubleHammer && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Slide (Double Hammer)
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getSlideDoubleHammerOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')}{' '}
                      {format(new Date(slideDoubleHammer.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {extractSlideDoubleHammerRows(
                    slideDoubleHammer.data,
                    slideDoubleHammer.alert,
                  ).map((section, idx) => (
                    <div key={idx} className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>{section.name}</span>
                        {getSeverityBadge(section.severity as 'NONE' | 'GREEN' | 'YELLOW' | 'RED')}
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
                          <TableRow className="bg-muted/30">
                            <TableHead
                              colSpan={6}
                              className="py-1 text-center text-xs text-muted-foreground"
                            >
                              ({unitLabel})
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/30">
                            {section.positions.map((pos, posIdx) => (
                              <TableCell key={posIdx} className="text-center">
                                {formatLength(pos as number | null)}
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-medium">
                              {formatLength(section.maxDeviation as number | null)}
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
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    GIBS - Outer After Adjustment
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getGibsOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')} {format(new Date(gibs.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Display usable value from alert if available */}
                  {gibs.alert && (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Usable Value ({unitLabel})</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatLength(gibs.alert.usable_value as number)}
                          </span>
                          {getSeverityBadge(gibs.alert.usable_severity)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display measurement points with diagram */}
                  <div className="overflow-hidden rounded-md border">
                    <div className="bg-muted/30 px-4 py-2 font-semibold">Measurement Points</div>

                    {/* Mobile layout: Image first, then two columns */}
                    <div className="flex flex-col gap-4 p-4 sm:hidden">
                      <div className="flex items-center justify-center">
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
                                <div className="mb-1 text-xs text-muted-foreground">
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
                                <div className="mb-1 text-xs text-muted-foreground">
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
                    <div className="hidden grid-cols-7 items-center p-4 sm:grid">
                      {/* Left column - points 2,1,4,3 */}
                      <div className="space-y-3">
                        {[2, 1, 4, 3].map((pointNum) => {
                          const point = extractGibsPoints(gibs.data)[pointNum - 1];
                          return (
                            <div key={pointNum}>
                              <div className="mb-1 text-xs text-muted-foreground">
                                {point.label}
                              </div>
                              <div className="font-medium">{point.value}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center - image */}
                      <div className="col-span-5 flex h-full items-center justify-center">
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
                              <div className="mb-1 text-xs text-muted-foreground">
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
                  <div className="mt-3 overflow-hidden rounded-md border">
                    <div className="bg-muted/30 px-4 py-2 font-semibold">
                      Left to Right Measurements
                    </div>

                    {/* Mobile layout: Image first, then two columns */}
                    <div className="flex flex-col gap-4 p-4 sm:hidden">
                      <div className="flex items-center justify-center">
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
                                <div className="mb-1 text-xs text-muted-foreground">
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
                                <div className="mb-1 text-xs text-muted-foreground">
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
                    <div className="hidden grid-cols-7 items-center p-4 sm:grid">
                      {/* Left column - points 13,9,15,11 */}
                      <div className="space-y-3">
                        {[13, 9, 15, 11].map((pointNum) => {
                          const point = extractGibsPoints(gibs.data)[pointNum - 1];
                          return (
                            <div key={pointNum}>
                              <div className="mb-1 text-xs text-muted-foreground">
                                {point.label}
                              </div>
                              <div className="font-medium">{point.value}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center - image */}
                      <div className="col-span-5 flex h-full items-center justify-center">
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
                              <div className="mb-1 text-xs text-muted-foreground">
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

            {pistons && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Pistons
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getPistonsOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')} {format(new Date(pistons.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Outer Section */}
                  {pistons.data.outerData && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>Outer</span>
                        {getSeverityBadge(getPistonsSeverity('outer'))}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Measurement</TableHead>
                            <TableHead className="text-center font-semibold">
                              Sum ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractPistonsRows(pistons.alert, 'outer').map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{row.field}</TableCell>
                              <TableCell className="text-center">{row.sum}</TableCell>
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
                  {pistons.data.innerData && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>Inner</span>
                        {getSeverityBadge(getPistonsSeverity('inner'))}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Measurement</TableHead>
                            <TableHead className="text-center font-semibold">
                              Sum ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractPistonsRows(pistons.alert, 'inner').map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{row.field}</TableCell>
                              <TableCell className="text-center">{row.sum}</TableCell>
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

            {lubrication && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    {t('lubrication.title')}
                  </Typography>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')}{' '}
                      {format(new Date(lubrication.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">{t('lubrication.field')}</TableHead>
                        <TableHead className="text-center font-semibold">
                          {t('lubrication.value')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">{t('lubrication.oilChanged')}</TableCell>
                        <TableCell className="text-center">
                          {formatYesNoDnc(lubrication.data.changedOil)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {t('lubrication.oilTemperature')}
                        </TableCell>
                        <TableCell className="text-center">
                          {lubrication.data.oilTemperature
                            ? `${lubrication.data.oilTemperature}${lubrication.data.oilTemperatureUnit === 'CELSIUS' ? '°C' : '°F'}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">{t('lubrication.oilMfgType')}</TableCell>
                        <TableCell className="text-center">
                          {lubrication.data.oilMfgType || '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {t('lubrication.filterChanged')}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatYesNoDnc(lubrication.data.changedFilter)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {lubrication.data.gauges && lubrication.data.gauges.length > 0 && (
                  <div className="mt-3">
                    <div className="overflow-hidden rounded-md border">
                      <div className="bg-muted/30 px-4 py-2 font-semibold">
                        {t('lubrication.systemGauges')}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                              {t('lubrication.system')}
                            </TableHead>
                            <TableHead className="font-semibold">
                              {t('lubrication.identifier')}
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              {t('lubrication.status')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lubrication.data.gauges.map((gauge, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{gauge.system || '-'}</TableCell>
                              <TableCell>{gauge.gaugeSwitchIdentifier || '-'}</TableCell>
                              <TableCell className="text-center">{gauge.psi || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {counterbalance && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Counterbalance Cylinder/Airbag
                  </Typography>
                  <div className="flex items-center gap-3">
                    {(countCounterbalanceIssues(counterbalance.data.outerData) > 0 ||
                      countCounterbalanceIssues(counterbalance.data.innerData) > 0) && (
                      <Badge variant="destructive">
                        {countCounterbalanceIssues(counterbalance.data.outerData) +
                          countCounterbalanceIssues(counterbalance.data.innerData)}{' '}
                        {t('problems')}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')}{' '}
                      {format(new Date(counterbalance.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {counterbalance.data.outerData && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>{t('counterbalance.outer')}</span>
                        <Badge variant="outline">
                          {counterbalance.data.outerData.counterbalanceType === 'CYLINDER'
                            ? t('counterbalance.cylinder')
                            : t('counterbalance.airbag')}
                        </Badge>
                      </div>
                      <div className="space-y-2 p-3 text-sm">
                        {[
                          { key: 'airbagPistonSeals', labelKey: 'pistonSeals' },
                          { key: 'regulator', labelKey: 'regulator' },
                          { key: 'gauge', labelKey: 'gauge' },
                          { key: 'pneumaticsPlumbing', labelKey: 'pneumaticsPlumbing' },
                          { key: 'rodSeals', labelKey: 'rodSeals' },
                          { key: 'rodBushing', labelKey: 'rodBushing' },
                          { key: 'oilWick', labelKey: 'oilWick' },
                        ].map(({ key, labelKey }) => {
                          const value =
                            counterbalance.data.outerData?.[
                              key as keyof CounterbalanceCylinderData
                            ];
                          // Type guard: only pass string values to formatCounterbalanceStatus
                          const stringValue = typeof value === 'string' ? value : undefined;
                          const status = formatCounterbalanceStatus(stringValue);
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                {t(`counterbalance.${labelKey}`)}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  status.isIssue
                                    ? 'border-red-200 bg-red-100 text-red-800'
                                    : status.text === t('counterbalance.status.ok')
                                      ? 'border-green-200 bg-green-100 text-green-800'
                                      : ''
                                }
                              >
                                {status.text}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {counterbalance.data.innerData && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 font-semibold">
                        <span>{t('counterbalance.inner')}</span>
                        <Badge variant="outline">
                          {counterbalance.data.innerData.counterbalanceType === 'CYLINDER'
                            ? t('counterbalance.cylinder')
                            : t('counterbalance.airbag')}
                        </Badge>
                      </div>
                      <div className="space-y-2 p-3 text-sm">
                        {[
                          { key: 'airbagPistonSeals', labelKey: 'pistonSeals' },
                          { key: 'regulator', labelKey: 'regulator' },
                          { key: 'gauge', labelKey: 'gauge' },
                          { key: 'pneumaticsPlumbing', labelKey: 'pneumaticsPlumbing' },
                          { key: 'rodSeals', labelKey: 'rodSeals' },
                          { key: 'rodBushing', labelKey: 'rodBushing' },
                          { key: 'oilWick', labelKey: 'oilWick' },
                        ].map(({ key, labelKey }) => {
                          const value =
                            counterbalance.data.innerData?.[
                              key as keyof CounterbalanceCylinderData
                            ];
                          // Type guard: only pass string values to formatCounterbalanceStatus
                          const stringValue = typeof value === 'string' ? value : undefined;
                          const status = formatCounterbalanceStatus(stringValue);
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                {t(`counterbalance.${labelKey}`)}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  status.isIssue
                                    ? 'border-red-200 bg-red-100 text-red-800'
                                    : status.text === t('counterbalance.status.ok')
                                      ? 'border-green-200 bg-green-100 text-green-800'
                                      : ''
                                }
                              >
                                {status.text}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {counterbalance.data.notes && (
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <span className="text-sm font-medium">Notas: </span>
                    <span className="text-sm">{counterbalance.data.notes}</span>
                  </div>
                )}

                {counterbalance.alerts && counterbalance.alerts.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-md border">
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 font-semibold text-red-800">
                      <span>Alertas Personalizados</span>
                      <Badge variant="destructive">{counterbalance.alerts.length}</Badge>
                    </div>
                    <div className="space-y-2 p-3">
                      {counterbalance.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="rounded border border-red-200 bg-red-50 p-2 text-sm"
                        >
                          <div className="font-medium text-red-800">
                            {alert.fieldName.replace(/_/g, ' ')}
                          </div>
                          <div className="mt-1 text-red-600">{alert.justification}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tramming && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Tramming
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getTrammingOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')} {format(new Date(tramming.latestServiceDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {tramming.data.outerData && tramming.alert && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="bg-muted/30 px-4 py-2 font-semibold">Outer</div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Position</TableHead>
                            <TableHead className="text-center font-semibold">
                              Vertical Sum ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                            <TableHead className="text-center font-semibold">
                              Horizontal Sum ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {['top', 'bottom', 'left', 'right'].map((position) => {
                            const verticalSumKey =
                              `outer_${position}_verticalSum` as keyof typeof tramming.alert;
                            const verticalSeverityKey =
                              `outer_${position}_verticalSeverity` as keyof typeof tramming.alert;
                            const horizontalSumKey =
                              `outer_${position}_horizontalSum` as keyof typeof tramming.alert;
                            const horizontalSeverityKey =
                              `outer_${position}_horizontalSeverity` as keyof typeof tramming.alert;

                            const verticalSum = tramming.alert?.[verticalSumKey] as number;
                            const verticalSeverity = tramming.alert?.[verticalSeverityKey] as
                              | 'NONE'
                              | 'GREEN'
                              | 'YELLOW'
                              | 'RED';
                            const horizontalSum = tramming.alert?.[horizontalSumKey] as number;
                            const horizontalSeverity = tramming.alert?.[horizontalSeverityKey] as
                              | 'NONE'
                              | 'GREEN'
                              | 'YELLOW'
                              | 'RED';

                            return (
                              <TableRow key={position} className="hover:bg-muted/30">
                                <TableCell className="font-medium capitalize">{position}</TableCell>
                                <TableCell className="text-center">
                                  {formatLength(verticalSum)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getSeverityBadge(verticalSeverity)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatLength(horizontalSum)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getSeverityBadge(horizontalSeverity)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {tramming.data.innerData && tramming.alert && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="bg-muted/30 px-4 py-2 font-semibold">Inner</div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Position</TableHead>
                            <TableHead className="text-center font-semibold">
                              Vertical Sum ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                            <TableHead className="text-center font-semibold">
                              Horizontal Sum ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {['top', 'bottom', 'left', 'right'].map((position) => {
                            const verticalSumKey =
                              `inner_${position}_verticalSum` as keyof typeof tramming.alert;
                            const verticalSeverityKey =
                              `inner_${position}_verticalSeverity` as keyof typeof tramming.alert;
                            const horizontalSumKey =
                              `inner_${position}_horizontalSum` as keyof typeof tramming.alert;
                            const horizontalSeverityKey =
                              `inner_${position}_horizontalSeverity` as keyof typeof tramming.alert;

                            const verticalSum = tramming.alert?.[verticalSumKey] as number;
                            const verticalSeverity = tramming.alert?.[verticalSeverityKey] as
                              | 'NONE'
                              | 'GREEN'
                              | 'YELLOW'
                              | 'RED';
                            const horizontalSum = tramming.alert?.[horizontalSumKey] as number;
                            const horizontalSeverity = tramming.alert?.[horizontalSeverityKey] as
                              | 'NONE'
                              | 'GREEN'
                              | 'YELLOW'
                              | 'RED';

                            return (
                              <TableRow key={position} className="hover:bg-muted/30">
                                <TableCell className="font-medium capitalize">{position}</TableCell>
                                <TableCell className="text-center">
                                  {formatLength(verticalSum)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getSeverityBadge(verticalSeverity)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatLength(horizontalSum)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getSeverityBadge(horizontalSeverity)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bearing Clearance Single Hammer Section */}
            {bearingClearanceSingleHammer && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Bearing Clearance - Single Hammer
                  </Typography>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(getBearingClearanceSingleHammerOverallSeverity())}
                    <span className="text-sm text-muted-foreground">
                      {t('updatedAt')}{' '}
                      {format(
                        new Date(bearingClearanceSingleHammer.latestServiceDate),
                        'dd-MM-yyyy',
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {bearingClearanceSingleHammer.data.data && (
                    <div className="overflow-hidden rounded-md border">
                      <div className="bg-muted/30 px-4 py-2 font-semibold">After Adjustment</div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Measurement</TableHead>
                            <TableHead className="text-center font-semibold">
                              Differential ({unitLabel})
                            </TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractBearingClearanceSingleHammerRows(
                            bearingClearanceSingleHammer.data.data,
                            bearingClearanceSingleHammer.alert,
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

            {/* Shim Thickness Section */}
            {shimThickness && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Shim Thickness
                  </Typography>
                  <span className="text-sm text-muted-foreground">
                    {t('updatedAt')}{' '}
                    {format(new Date(shimThickness.latestServiceDate), 'dd-MM-yyyy')}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {shimThickness.data.outerLhData && (
                    <div className="rounded-md border p-3">
                      <div className="mb-2 font-semibold">Outer LH</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Top:</span>
                          <span>{formatLength(shimThickness.data.outerLhData.top)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bottom:</span>
                          <span>{formatLength(shimThickness.data.outerLhData.bottom)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Left:</span>
                          <span>{formatLength(shimThickness.data.outerLhData.left)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Right:</span>
                          <span>{formatLength(shimThickness.data.outerLhData.right)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {shimThickness.data.outerRhData && (
                    <div className="rounded-md border p-3">
                      <div className="mb-2 font-semibold">Outer RH</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Top:</span>
                          <span>{formatLength(shimThickness.data.outerRhData.top)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bottom:</span>
                          <span>{formatLength(shimThickness.data.outerRhData.bottom)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Left:</span>
                          <span>{formatLength(shimThickness.data.outerRhData.left)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Right:</span>
                          <span>{formatLength(shimThickness.data.outerRhData.right)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {shimThickness.data.innerLhData && (
                    <div className="rounded-md border p-3">
                      <div className="mb-2 font-semibold">Inner LH</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Top:</span>
                          <span>{formatLength(shimThickness.data.innerLhData.top)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bottom:</span>
                          <span>{formatLength(shimThickness.data.innerLhData.bottom)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Left:</span>
                          <span>{formatLength(shimThickness.data.innerLhData.left)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Right:</span>
                          <span>{formatLength(shimThickness.data.innerLhData.right)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {shimThickness.data.innerRhData && (
                    <div className="rounded-md border p-3">
                      <div className="mb-2 font-semibold">Inner RH</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Top:</span>
                          <span>{formatLength(shimThickness.data.innerRhData.top)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bottom:</span>
                          <span>{formatLength(shimThickness.data.innerRhData.bottom)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Left:</span>
                          <span>{formatLength(shimThickness.data.innerRhData.left)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Right:</span>
                          <span>{formatLength(shimThickness.data.innerRhData.right)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {shimThickness.data.notes && (
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <span className="text-sm font-medium">Notes: </span>
                    <span className="text-sm">{shimThickness.data.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Die Cushion Section */}
            {dieCushion && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Die Cushion
                  </Typography>
                  <span className="text-sm text-muted-foreground">
                    {t('updatedAt')} {format(new Date(dieCushion.latestServiceDate), 'dd-MM-yyyy')}
                  </span>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Air Leaks</TableCell>
                        <TableCell className="text-right">
                          {dieCushion.data.airLeaks || '-'}
                        </TableCell>
                      </TableRow>
                      {dieCushion.data.airLeaksLocation && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">Air Leaks Location</TableCell>
                          <TableCell className="text-right">
                            {dieCushion.data.airLeaksLocation}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Pneumatics/Plumbing</TableCell>
                        <TableCell className="text-right">
                          {dieCushion.data.pneumaticsPlumbing || '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Lubrication</TableCell>
                        <TableCell className="text-right">
                          {dieCushion.data.lubrication || '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {dieCushion.data.notes && (
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <span className="text-sm font-medium">Notes: </span>
                    <span className="text-sm">{dieCushion.data.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Electrical Control Section */}
            {electricalControl && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Electrical Control
                  </Typography>
                  <span className="text-sm text-muted-foreground">
                    {t('updatedAt')}{' '}
                    {format(new Date(electricalControl.latestServiceDate), 'dd-MM-yyyy')}
                  </span>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableBody>
                      {electricalControl.data.hasHourMeter && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">Has Hour Meter</TableCell>
                          <TableCell className="text-right">
                            {electricalControl.data.hasHourMeter}
                          </TableCell>
                        </TableRow>
                      )}
                      {electricalControl.data.hourMeterReading && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">Hour Meter Reading</TableCell>
                          <TableCell className="text-right">
                            {electricalControl.data.hourMeterReading}
                          </TableCell>
                        </TableRow>
                      )}
                      {electricalControl.data.controlDoorStop && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">Control Door Stop</TableCell>
                          <TableCell className="text-right">
                            {electricalControl.data.controlDoorStop}
                          </TableCell>
                        </TableRow>
                      )}
                      {electricalControl.data.cabinetTemp && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">Cabinet Temp</TableCell>
                          <TableCell className="text-right">
                            {electricalControl.data.cabinetTemp}
                          </TableCell>
                        </TableRow>
                      )}
                      {electricalControl.data.safetyRelays && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">Safety Relays</TableCell>
                          <TableCell className="text-right">
                            {electricalControl.data.safetyRelays}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {electricalControl.data.notes && (
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <span className="text-sm font-medium">Notes: </span>
                    <span className="text-sm">{electricalControl.data.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Perpendicularity Section */}
            {perpendicularity && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Perpendicularity
                  </Typography>
                  <span className="text-sm text-muted-foreground">
                    {t('updatedAt')}{' '}
                    {format(new Date(perpendicularity.latestServiceDate), 'dd-MM-yyyy')}
                  </span>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Has Been Adjusted</TableCell>
                        <TableCell className="text-right">
                          {perpendicularity.data.hasBeenAdjusted || '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Before F-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(perpendicularity.data.beforeFR)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Before L-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(perpendicularity.data.beforeLR)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">After F-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(perpendicularity.data.afterFR)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">After L-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(perpendicularity.data.afterLR)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {perpendicularity.data.notes && (
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <span className="text-sm font-medium">Notes: </span>
                    <span className="text-sm">{perpendicularity.data.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Angularity Section */}
            {angularity && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold">
                    Angularity
                  </Typography>
                  <span className="text-sm text-muted-foreground">
                    {t('updatedAt')} {format(new Date(angularity.latestServiceDate), 'dd-MM-yyyy')}
                  </span>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Has Been Adjusted</TableCell>
                        <TableCell className="text-right">
                          {angularity.data.hasBeenAdjusted || '-'}
                        </TableCell>
                      </TableRow>
                      {angularity.data.spm !== undefined && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">SPM</TableCell>
                          <TableCell className="text-right">{angularity.data.spm}</TableCell>
                        </TableRow>
                      )}
                      {angularity.data.counterbalancePressure !== undefined && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            Counterbalance Pressure (PSI)
                          </TableCell>
                          <TableCell className="text-right">
                            {angularity.data.counterbalancePressure}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Before F-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(angularity.data.beforeFR)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">Before L-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(angularity.data.beforeLR)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">After F-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(angularity.data.afterFR)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">After L-R ({unitLabel})</TableCell>
                        <TableCell className="text-right">
                          {formatLength(angularity.data.afterLR)}
                        </TableCell>
                      </TableRow>
                      {angularity.data.totalLiftCheck !== undefined && (
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            Total Lift Check ({unitLabel})
                          </TableCell>
                          <TableCell className="text-right">
                            {formatLength(angularity.data.totalLiftCheck)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {angularity.data.notes && (
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <span className="text-sm font-medium">Notes: </span>
                    <span className="text-sm">{angularity.data.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <Typography variant="muted">Nenhum dado registrado ainda.</Typography>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t px-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExportPDF}
          disabled={isExporting}
          data-export-button
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Baixar PDF
        </Button>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Fechar
        </Button>
      </div>
    </DialogContent>
  );
}
