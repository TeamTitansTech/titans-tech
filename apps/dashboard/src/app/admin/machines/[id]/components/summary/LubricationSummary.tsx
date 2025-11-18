'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';

interface LubricationSummaryProps {
  data: any;
}

export function LubricationSummary({ data }: LubricationSummaryProps) {
  const tTable = useTranslations('table');
  const tServicesSummary = useTranslations('services.modal.summary');

  // Helper function to check if a field is an ID field
  const isIdField = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return (
      key === 'id' ||
      key.endsWith('Id') ||
      key.endsWith('ID') ||
      lowerKey === 'id' ||
      lowerKey === 'createdat' ||
      lowerKey === 'updatedat' ||
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'created_at' ||
      key === 'updated_at'
    );
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  // Filter out object/array fields and ID fields (we'll handle gauges separately)
  const scalarFields = Object.entries(data).filter(
    ([key, value]) =>
      !isIdField(key) &&
      key !== 'gauges' &&
      (typeof value !== 'object' || value === null) &&
      value !== null &&
      value !== undefined &&
      value !== '',
  );

  const gauges = Array.isArray(data.gauges) ? data.gauges : [];

  return (
    <div className="text-xs space-y-3">
      {/* Scalar fields table */}
      {scalarFields.length > 0 && (
        <div className="border-t pt-2 mb-3">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                    {tTable('field')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                    {tTable('value')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scalarFields.map(([key, value]) => (
                  <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {formatFieldName(key)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">{displayValue(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Gauges table */}
      {gauges.length > 0 && (
        <div className="border-t pt-2">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tServicesSummary('gauges')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                    {tTable('system')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                    {tTable('gauge')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                    {tTable('psi')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gauges.map((gauge: any, idx: number) => (
                  <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {displayValue(gauge.system)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center border-r">
                      {displayValue(gauge.gauge)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">{displayValue(gauge.psi)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Show message if no data to display */}
      {scalarFields.length === 0 && gauges.length === 0 && (
        <div className="border-t pt-2">
          <Typography variant="muted" className="text-center py-4 text-xs">
            Nenhum dado disponível
          </Typography>
        </div>
      )}
    </div>
  );
}
