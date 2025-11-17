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
        return <Badge className="bg-green-500 hover:bg-green-600">OK</Badge>;
      case 'NONE':
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  // Extract bearing clearance measurement rows
  const extractBearingRows = (
    data: BearingClearanceData,
    alert?: LatestBearingClearance['alert'],
  ) => {
    return BEARING_FIELD_NAMES.map((field) => {
      // Type-safe access to RH/LH values
      const lhKey = `${field}_LH` as keyof BearingClearanceData;
      const rhKey = `${field}_RH` as keyof BearingClearanceData;
      const lh = data[lhKey] as number | undefined;
      const rh = data[rhKey] as number | undefined;

      // Type-safe access to alert data
      const differential = alert
        ? (alert[`${field}_differential` as keyof typeof alert] as number | undefined)
        : lh && rh
          ? Math.abs(rh - lh)
          : undefined;

      const severity = alert
        ? (alert[`${field}_severity` as keyof typeof alert] as 'NONE' | 'GREEN' | 'YELLOW' | 'RED')
        : ('NONE' as const);

      return {
        field: BEARING_FIELD_LABELS[field],
        lh: typeof lh === 'number' ? lh.toFixed(3) : '-',
        rh: typeof rh === 'number' ? rh.toFixed(3) : '-',
        differential: typeof differential === 'number' ? differential.toFixed(3) : '-',
        severity,
      };
    });
  };

  const bearingClearance = report.sections.BEARING_CLEARANCE;

  // Get overall worst severity for header badge
  const getOverallSeverity = (): 'NONE' | 'GREEN' | 'YELLOW' | 'RED' => {
    if (!bearingClearance?.alert) return 'NONE';

    const severities = [
      bearingClearance.alert.totalClearance_severity,
      bearingClearance.alert.mainBearings_severity,
      bearingClearance.alert.upperConnectionBearings_severity,
      bearingClearance.alert.wristPinToMatingPart_severity,
      bearingClearance.alert.wristPinToBushing_severity,
      bearingClearance.alert.slideAdjNutToScrewSleeve_severity,
    ];

    if (severities.includes('RED')) return 'RED';
    if (severities.includes('YELLOW')) return 'YELLOW';
    if (severities.includes('GREEN')) return 'GREEN';
    return 'NONE';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatório Atualizado - {report.machineName}
              </DialogTitle>
              <DialogDescription>
                Modelo: {report.blueprint.name} · Última atualização:{' '}
                {format(new Date(report.generatedAt), 'dd/MM/yyyy', { locale: ptBR })}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4">
          {bearingClearance ? (
            <div className="space-y-4">
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

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Measurement</TableHead>
                        <TableHead className="text-center font-semibold">LH</TableHead>
                        <TableHead className="text-center font-semibold">RH</TableHead>
                        <TableHead className="text-center font-semibold">Differential</TableHead>
                        <TableHead className="text-center font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractBearingRows(bearingClearance.data, bearingClearance.alert).map(
                        (row, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{row.field}</TableCell>
                            <TableCell className="text-center">{row.lh}</TableCell>
                            <TableCell className="text-center">{row.rh}</TableCell>
                            <TableCell className="text-center">{row.differential}</TableCell>
                            <TableCell className="text-center">
                              {getSeverityBadge(row.severity)}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <Typography variant="h4" className="font-semibold mb-2">
                  Outras Seções
                </Typography>
                <Typography variant="muted" className="text-sm">
                  Clutch and Brake Clearance, Slide, Gibs e outras seções serão adicionadas em
                  breve.
                </Typography>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <Typography variant="muted">
                Nenhum dado de Bearing Clearance registrado ainda.
              </Typography>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 px-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
